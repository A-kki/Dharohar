package com.dharohar.controller;

import com.dharohar.model.Asset;
import com.dharohar.model.LedgerBlock;
import com.dharohar.model.User;
import com.dharohar.repository.AssetRepository;
import com.dharohar.repository.UserRepository;
import com.dharohar.service.LedgerService;
import com.dharohar.service.StorageService;
import com.dharohar.service.TranscriptionAndAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/assets")
public class AssetController {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StorageService storageService;

    @Autowired
    private TranscriptionAndAIService transcriptionAndAIService;

    @Autowired
    private LedgerService ledgerService;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User context invalid"));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Asset> createAsset(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("tribalMember") String tribalMember,
            @RequestParam("community") String community,
            @RequestParam("type") String type,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "performanceContext", required = false) String performanceContext,
            @RequestParam(value = "riskTier", required = false) String riskTier,
            @RequestParam(value = "lyrics", required = false) String lyrics,
            @RequestParam(value = "culturalMeaning", required = false) String culturalMeaning,
            @RequestParam("location") String location,
            @RequestParam(value = "mediaFile", required = false) MultipartFile mediaFile) {

        User user = getCurrentUser();

        Asset asset = new Asset();
        asset.setTitle(title);
        asset.setDescription(description);
        asset.setTribalMember(tribalMember);
        asset.setCommunityName(community);
        asset.setType(type);
        asset.setCategory(category);
        asset.setPerformanceContext(performanceContext);
        asset.setRiskTier(riskTier != null ? riskTier : "LOW");
        asset.setLyrics(lyrics);
        asset.setCulturalMeaning(culturalMeaning);
        asset.setLocation(location);
        asset.setTimestamp(LocalDateTime.now().toString());
        asset.setCreatedBy(user.getId());
        asset.setApprovalStatus("PENDING"); // Match repository/dashboard expectation

        if (mediaFile != null && !mediaFile.isEmpty()) {
            String fileUrl = storageService.storeFile(mediaFile, type.toLowerCase() + "-media");
            asset.setMediaUrl("/api/uploads/" + fileUrl);
            asset.setMediaFileId("/api/uploads/" + fileUrl);
            asset.setLocalFilePath(fileUrl);
            asset.setContentHash(storageService.calculateHash(mediaFile));
        } else {
            asset.setContentHash("no-file-hash");
        }

        Asset savedAsset = assetRepository.save(asset);

        // Async process transcription, classification, and safety audits
        transcriptionAndAIService.processAssetAI(savedAsset.getId());

        return ResponseEntity.ok(savedAsset);
    }

    @PostMapping(consumes = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<Asset> createAssetJson(@RequestBody Map<String, Object> payload) {
        User user = getCurrentUser();

        Asset asset = new Asset();
        asset.setTitle((String) payload.get("title"));
        asset.setDescription((String) payload.get("description"));
        asset.setTribalMember((String) payload.get("recordeeName"));
        asset.setCommunityName((String) payload.get("communityName"));
        asset.setType((String) payload.get("type"));
        
        if (payload.containsKey("riskTier")) {
            asset.setRiskTier((String) payload.get("riskTier"));
        } else {
            asset.setRiskTier("LOW");
        }
        
        if (payload.containsKey("metadata") && payload.get("metadata") instanceof Map) {
            Map<?, ?> metadata = (Map<?, ?>) payload.get("metadata");
            if (metadata.containsKey("category")) {
                asset.setCategory((String) metadata.get("category"));
            }
            if (metadata.containsKey("performanceContext")) {
                asset.setPerformanceContext((String) metadata.get("performanceContext"));
            }
            if (metadata.containsKey("location")) {
                asset.setLocation((String) metadata.get("location"));
            }
            if (metadata.containsKey("lyrics")) {
                asset.setLyrics((String) metadata.get("lyrics"));
            }
            if (metadata.containsKey("culturalMeaning")) {
                asset.setCulturalMeaning((String) metadata.get("culturalMeaning"));
            }
        }
        
        if (payload.containsKey("location") && asset.getLocation() == null) {
            asset.setLocation((String) payload.get("location"));
        }
        
        asset.setTimestamp(LocalDateTime.now().toString());
        asset.setCreatedBy(user.getId());
        asset.setApprovalStatus("PENDING");

        if (payload.containsKey("mediaFileId")) {
            String fileUrl = (String) payload.get("mediaFileId");
            asset.setMediaUrl(fileUrl);
            asset.setMediaFileId(fileUrl);
            if (fileUrl.startsWith("/api/uploads/")) {
                asset.setLocalFilePath(fileUrl.substring("/api/uploads/".length()));
            } else {
                asset.setLocalFilePath(fileUrl);
            }
            asset.setContentHash(sha256(fileUrl));
        } else {
            asset.setContentHash("no-file-hash");
        }

        Asset savedAsset = assetRepository.save(asset);

        transcriptionAndAIService.processAssetAI(savedAsset.getId());

        return ResponseEntity.ok(savedAsset);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<Asset>> getMyAssets() {
        User user = getCurrentUser();
        List<Asset> assets = assetRepository.findByCreatedBy(user.getId());
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/all-debug")
    public ResponseEntity<List<Asset>> getAllDebug() {
        return ResponseEntity.ok(assetRepository.findAll());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Asset>> getPendingAssets() {
        List<Asset> assets = assetRepository.findByApprovalStatusIgnoreCase("PENDING");
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/reviewed")
    public ResponseEntity<List<Asset>> getReviewedAssets() {
        List<Asset> approved = assetRepository.findByApprovalStatusIgnoreCase("APPROVED");
        List<Asset> rejected = assetRepository.findByApprovalStatusIgnoreCase("REJECTED");
        List<Asset> all = new java.util.ArrayList<>();
        all.addAll(approved);
        all.addAll(rejected);
        return ResponseEntity.ok(all);
    }

    @GetMapping("/public")
    public ResponseEntity<Map<String, Object>> getPublicAssets(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "12") int limit) {
        
        List<Asset> assets = assetRepository.findByApprovalStatusIgnoreCase("APPROVED");
        
        List<Asset> sanitized = assets.stream().map(a -> {
            Asset clean = new Asset();
            clean.setId(a.getId());
            clean.setTitle(a.getTitle());
            clean.setDescription(a.getDescription());
            clean.setCommunityName(a.getCommunityName());
            clean.setTribalMember(a.getTribalMember());
            clean.setType(a.getType());
            clean.setCategory(a.getCategory());
            clean.setPerformanceContext(a.getPerformanceContext());
            clean.setRiskTier(a.getRiskTier());
            clean.setLocation(a.getLocation());
            clean.setTimestamp(a.getTimestamp());
            clean.setMediaUrl(a.getMediaUrl());
            clean.setScientificName(a.getScientificName());
            clean.setLedgerIndex(a.getLedgerIndex());
            clean.setPreparationMethod("Hidden - Requires Institutional Research License");
            clean.setTranscript("Sanitized under Sovereign Heritage Protection Framework");
            return clean;
        }).collect(Collectors.toList());

        int total = sanitized.size();
        int fromIndex = (page - 1) * limit;
        int toIndex = Math.min(fromIndex + limit, total);
        
        List<Asset> pageList;
        if (fromIndex < total) {
            pageList = sanitized.subList(fromIndex, toIndex);
        } else {
            pageList = new java.util.ArrayList<>();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("assets", pageList);
        response.put("total", total);
        response.put("page", page);
        response.put("hasMore", toIndex < total);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sonic/{id}/play")
    public ResponseEntity<Map<String, String>> getSonicPlayUrl(@PathVariable("id") String id) {
        Asset asset = assetRepository.findById(id)
                .orElseGet(() -> assetRepository.findByMediaFileId(id)
                        .orElseGet(() -> assetRepository.findByMediaFileIdContaining(id)
                                .orElseThrow(() -> new IllegalArgumentException("Asset not found for ID: " + id))
                        )
                );
        
        Map<String, String> response = new HashMap<>();
        response.put("assetId", asset.getId());
        response.put("previewUrl", asset.getMediaUrl());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Asset> approveAsset(@PathVariable("id") String id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found"));

        asset.setApprovalStatus("APPROVED");
        asset.setReviewComment(null);

        LedgerBlock block = ledgerService.commitRecord("ASSET", asset.getId(), asset.getContentHash());
        asset.setLedgerIndex(block.getIndex());

        Asset saved = assetRepository.save(asset);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Asset> rejectAsset(
            @PathVariable("id") String id,
            @RequestBody Map<String, String> body) {
        
        String comment = body.get("reviewComment");
        if (comment == null || comment.trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection requires a review comment");
        }

        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found"));

        asset.setApprovalStatus("REJECTED");
        asset.setReviewComment(comment);

        Asset saved = assetRepository.save(asset);
        return ResponseEntity.ok(saved);
    }

    private String sha256(String data) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return "hash-failed";
        }
    }
}
