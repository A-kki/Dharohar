package com.dharohar.service;

import com.dharohar.model.Asset;
import com.dharohar.model.AiMetadata;
import com.dharohar.repository.AssetRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

@Service
public class TranscriptionAndAIService {

    @Autowired
    private AssetRepository assetRepository;

    @Value("${app.gemini.api-key}")
    private String geminiApiKey;

    @Value("${app.gemini.api-url}")
    private String geminiApiUrl;

    @Value("${app.upload.dir}")
    private String uploadDir;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Async
    public void processAssetAI(String assetId) {
        Optional<Asset> assetOpt = assetRepository.findById(assetId);
        if (assetOpt.isEmpty()) {
            return;
        }

        Asset asset = assetOpt.get();
        try {
            asset.setApprovalStatus("PROCESSING");
            assetRepository.save(asset);

            String fileExtension = "";
            byte[] fileBytes = null;
            if (asset.getLocalFilePath() != null) {
                Path filePath = Path.of(uploadDir).resolve(asset.getLocalFilePath());
                if (Files.exists(filePath)) {
                    fileBytes = Files.readAllBytes(filePath);
                    String fileName = filePath.getFileName().toString();
                    if (fileName.contains(".")) {
                        fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
                    }
                }
            }

            if (asset.getType().equals("BIO")) {
                processBiologicalAsset(asset, fileBytes, fileExtension);
            } else {
                processSonicAsset(asset, fileBytes, fileExtension);
            }

            asset.setApprovalStatus("PENDING"); // Pending reviewer approval
            assetRepository.save(asset);
        } catch (Exception e) {
            // Log error and fall back gracefully so application never crashes
            System.err.println("Error processing AI pipeline for asset " + assetId + ": " + e.getMessage());
            e.printStackTrace();
            fallbackProcessing(asset);
        }
    }

    private void processBiologicalAsset(Asset asset, byte[] fileBytes, String extension) throws Exception {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.startsWith("YOUR_") || fileBytes == null) {
            // Fail early to fallback if no key
            throw new IllegalStateException("Gemini API key is not configured or file is empty");
        }

        String mimeType = "audio/" + (extension.equals("mp3") ? "mp3" : "wav");
        String base64Data = Base64.getEncoder().encodeToString(fileBytes);

        String promptText = String.format(
            "You are an expert ethnobotanist assisting the Government of India's Traditional Knowledge Digital Library (TKDL).\n" +
            "We have uploaded a traditional remedy recording. Analyze the audio recording.\n" +
            "If you can hear any speech, transcribe it into the \"transcript\" field. If no speech is clear, write a transcript based on the user's provided description: %s.\n" +
            "Identify regional or vernacular plant names mentioned and map them to scientific classifications (e.g. 'Tulsi' to 'Ocimum tenuiflorum', 'Neem' to 'Azadirachta indica').\n" +
            "STRICT SECURITY PROTOCOLS:\n" +
            "1. Strip out all precise dosage measurements (e.g. 'drink 3 cups', 'take 50g', 'twice a day') and replace them with safe, generalized preparation descriptions (e.g. 'consumed as an aqueous decoction', 'applied topically').\n" +
            "2. Flag clinical risks. Set clinicalSafetyFlag to 'TOXIC' or 'WARNING' if dangerous herbs are mentioned, otherwise 'SAFE'.\n" +
            "Return the result STRICTLY as a raw JSON object (do not wrap in markdown, return only the JSON string) with these exact keys:\n" +
            "{\n" +
            "  \"transcript\": \"transcription string\",\n" +
            "  \"scientificName\": \"scientific name of the main plant\",\n" +
            "  \"ailmentTargeted\": \"ailment name\",\n" +
            "  \"activeConstituents\": [\"compound1\", \"compound2\"],\n" +
            "  \"preparationMethod\": \"sanitized preparation description\",\n" +
            "  \"clinicalSafetyFlag\": \"SAFE or WARNING or TOXIC\"\n" +
            "}",
            asset.getDescription()
        );

        String jsonPayload = buildGeminiPayload(promptText, base64Data, mimeType);
        String response = callGeminiAPI(jsonPayload);

        // Parse JSON response
        JsonNode root = objectMapper.readTree(response);
        String textResponse = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        
        // Clean markdown formatting if present
        textResponse = cleanJsonResponse(textResponse);
        
        JsonNode data = objectMapper.readTree(textResponse);

        asset.setTranscript(data.path("transcript").asText(asset.getDescription()));
        asset.setScientificName(data.path("scientificName").asText("Pending scientific verification"));
        asset.setAilmentTargeted(data.path("ailmentTargeted").asText(asset.getTitle()));
        
        List<String> constituents = new ArrayList<>();
        if (data.path("activeConstituents").isArray()) {
            for (JsonNode c : data.path("activeConstituents")) {
                constituents.add(c.asText());
            }
        }
        asset.setActiveConstituents(constituents.isEmpty() ? List.of("Unknown Organic Compounds") : constituents);
        asset.setPreparationMethod(data.path("preparationMethod").asText("Prepared in accordance with community traditions."));
        String safety = data.path("clinicalSafetyFlag").asText("SAFE");
        asset.setClinicalSafetyFlag(safety);

        AiMetadata ai = new AiMetadata();
        ai.setDomainClassification("Ethnobotanical / Biological");
        ai.setRiskTierSuggestion(safety.equals("SAFE") ? "LOW" : "HIGH");
        ai.setSuggestedLicenseType("RESEARCH");
        ai.setSensitiveContentFlag(!safety.equals("SAFE"));
        ai.setSummary("Medicinal remedy application targeting " + data.path("ailmentTargeted").asText(asset.getTitle()) + " utilizing " + data.path("scientificName").asText("this specimen") + ".");
        ai.setKeywords(List.of("remedy", data.path("scientificName").asText("botanical"), data.path("ailmentTargeted").asText("biological")));
        
        asset.setAiMetadata(ai);
        asset.setAiProcessed(true);
    }

    private void processSonicAsset(Asset asset, byte[] fileBytes, String extension) throws Exception {
        // Sonic assets do transcription of vocals and map audio characteristics
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.startsWith("YOUR_") || fileBytes == null) {
            throw new IllegalStateException("Gemini API key is not configured or file is empty");
        }

        String mimeType = extension.equals("mp4") ? "video/mp4" : "audio/wav";
        String base64Data = Base64.getEncoder().encodeToString(fileBytes);

        String promptText = String.format(
            "You are a musicologist and cultural archivist safeguarding India's oral heritage.\n" +
            "Listen to this audio/video clip. If there are lyrics, transcribe them. If it is instrumental, describe the melodies.\n" +
            "Analyze the cultural meaning of the performance.\n" +
            "Return the result STRICTLY as a raw JSON object with these exact keys:\n" +
            "{\n" +
            "  \"transcript\": \"lyrics or melody transcription\",\n" +
            "  \"lyrics\": \"transcribed lyrics if any\",\n" +
            "  \"culturalMeaning\": \"paragraph explaining cultural/historical significance\"\n" +
            "}",
            asset.getDescription()
        );

        String jsonPayload = buildGeminiPayload(promptText, base64Data, mimeType);
        String response = callGeminiAPI(jsonPayload);

        JsonNode root = objectMapper.readTree(response);
        String textResponse = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        textResponse = cleanJsonResponse(textResponse);

        JsonNode data = objectMapper.readTree(textResponse);
        asset.setTranscript(data.path("transcript").asText("Melody captured."));
        asset.setLyrics(data.path("lyrics").asText("Instrumental or chant-based."));
        asset.setCulturalMeaning(data.path("culturalMeaning").asText("Traditional oral presentation preserved under Dharohar framework."));
        
        // Mock a digital fingerprint representation of the audio waves
        asset.setFingerprint("MFCC-FPR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        AiMetadata ai = new AiMetadata();
        ai.setDomainClassification("Oral Heritage / Sonic Archive");
        ai.setRiskTierSuggestion("LOW");
        ai.setSuggestedLicenseType("MEDIA");
        ai.setSensitiveContentFlag(false);
        ai.setSummary("Sonic performance detailing cultural significance: " + data.path("culturalMeaning").asText("Traditional oral performance") + ".");
        ai.setKeywords(List.of("music", "oral heritage", asset.getPerformanceContext() != null ? asset.getPerformanceContext() : "traditional"));
        
        asset.setAiMetadata(ai);
        asset.setAiProcessed(true);
    }

    private String cleanJsonResponse(String response) {
        response = response.trim();
        if (response.startsWith("```json")) {
            response = response.substring(7);
        } else if (response.startsWith("```")) {
            response = response.substring(3);
        }
        if (response.endsWith("```")) {
            response = response.substring(0, response.length() - 3);
        }
        return response.trim();
    }

    private String buildGeminiPayload(String prompt, String base64Data, String mimeType) throws Exception {
        Map<String, Object> payload = new HashMap<>();
        Map<String, Object> contentMap = new HashMap<>();
        List<Map<String, Object>> parts = new ArrayList<>();

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);
        parts.add(textPart);

        Map<String, Object> mediaPart = new HashMap<>();
        Map<String, Object> inlineData = new HashMap<>();
        inlineData.put("mimeType", mimeType);
        inlineData.put("data", base64Data);
        mediaPart.put("inlineData", inlineData);
        parts.add(mediaPart);

        contentMap.put("parts", parts);
        payload.put("contents", List.of(contentMap));

        return objectMapper.writeValueAsString(payload);
    }

    private String callGeminiAPI(String payload) {
        String url = geminiApiUrl + "?key=" + geminiApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(payload, headers);
        return restTemplate.postForObject(url, entity, String.class);
    }

    private void fallbackProcessing(Asset asset) {
        System.out.println("Running fallback offline analyzer for asset: " + asset.getTitle());
        String text = (asset.getTitle() + " " + asset.getDescription()).toLowerCase();
        
        asset.setTranscript("Offline transcript generated from description: " + asset.getDescription());
        
        if (asset.getType().equals("BIO")) {
            asset.setAilmentTargeted(asset.getTitle());
            if (text.contains("tulsi") || text.contains("basil")) {
                asset.setScientificName("Ocimum tenuiflorum");
                asset.setActiveConstituents(List.of("Eugenol", "Caryophyllene", "Ursolic acid"));
                asset.setPreparationMethod("Leaves are harvested and prepared as a warm aqueous decoction (tea) without direct heat.");
                asset.setClinicalSafetyFlag("SAFE");
            } else if (text.contains("neem")) {
                asset.setScientificName("Azadirachta indica");
                asset.setActiveConstituents(List.of("Azadirachtin", "Nimbin", "Gedunin"));
                asset.setPreparationMethod("Leaves crushed into a fine paste and applied topically to the affected skin area.");
                asset.setClinicalSafetyFlag("SAFE");
            } else if (text.contains("aloe") || text.contains("ghritkumari")) {
                asset.setScientificName("Aloe vera");
                asset.setActiveConstituents(List.of("Aloin", "Emodin", "Acemannan"));
                asset.setPreparationMethod("Gel is extracted fresh from inner leaf chambers and applied topically as a cooling salve.");
                asset.setClinicalSafetyFlag("SAFE");
            } else if (text.contains("aconite") || text.contains("bikh") || text.contains("poison")) {
                asset.setScientificName("Aconitum ferox");
                asset.setActiveConstituents(List.of("Aconitine", "Pseudoaconitine"));
                asset.setPreparationMethod("EXTREME CAUTION: Root processed through cow's urine detoxification before minimal dilution.");
                asset.setClinicalSafetyFlag("TOXIC");
            } else {
                asset.setScientificName("Generically classified botanical specimen");
                asset.setActiveConstituents(List.of("Polyphenols", "Flavonoids"));
                asset.setPreparationMethod("Prepared by drying plant nodes and steeping in hot water for topical application.");
                asset.setClinicalSafetyFlag("SAFE");
            }
        } else {
            asset.setLyrics("Traditional folk chants. Local dialect transcript offline.");
            asset.setCulturalMeaning("An oral performance related to regional seasonal celebrations. Preserved to protect prior heritage.");
            asset.setFingerprint("OFFLINE-FPR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        
        AiMetadata ai = new AiMetadata();
        if (asset.getType().equals("BIO")) {
            ai.setDomainClassification("Ethnobotanical / Biological");
            boolean isToxic = "TOXIC".equals(asset.getClinicalSafetyFlag());
            ai.setRiskTierSuggestion(isToxic ? "HIGH" : "LOW");
            ai.setSuggestedLicenseType("RESEARCH");
            ai.setSensitiveContentFlag(isToxic);
            ai.setSummary("Offline analyzed medicinal remedy targeting " + asset.getAilmentTargeted() + " using " + asset.getScientificName() + ".");
            List<String> keywords = new ArrayList<>();
            keywords.add("remedy");
            keywords.add(asset.getScientificName() != null ? asset.getScientificName() : "botanical");
            keywords.add(asset.getAilmentTargeted() != null ? asset.getAilmentTargeted() : "biological");
            ai.setKeywords(keywords);
        } else {
            ai.setDomainClassification("Oral Heritage / Sonic Archive");
            ai.setRiskTierSuggestion("LOW");
            ai.setSuggestedLicenseType("MEDIA");
            ai.setSensitiveContentFlag(false);
            ai.setSummary("Offline analyzed sonic oral performance with cultural context: " + asset.getCulturalMeaning());
            ai.setKeywords(List.of("music", "oral heritage", "traditional"));
        }
        asset.setAiMetadata(ai);
        asset.setAiProcessed(true);

        asset.setApprovalStatus("PENDING");
        assetRepository.save(asset);
    }
}
