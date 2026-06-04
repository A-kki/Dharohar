package com.dharohar.controller;

import com.dharohar.model.Asset;
import com.dharohar.model.LedgerBlock;
import com.dharohar.model.LicenseRequest;
import com.dharohar.model.User;
import com.dharohar.repository.AssetRepository;
import com.dharohar.repository.LicenseRequestRepository;
import com.dharohar.repository.UserRepository;
import com.dharohar.service.LedgerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/licenses")
public class LicenseController {

    @Autowired
    private LicenseRequestRepository licenseRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LedgerService ledgerService;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User context invalid"));
    }

    @GetMapping("/ledger/verify")
    public ResponseEntity<Map<String, Object>> verifyLedger() {
        boolean isValid = ledgerService.verifyLedgerIntegrity();
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("isValid", isValid);
        response.put("status", isValid ? "INTEGRAL" : "COMPROMISED");
        response.put("checkedAt", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/apply")
    public ResponseEntity<LicenseRequest> requestLicense(@RequestBody LicenseRequest payload) {
        Asset asset = assetRepository.findById(payload.getAssetId())
                .orElseThrow(() -> new IllegalArgumentException("Asset not found"));

        User user = getCurrentUser();

        LicenseRequest req = new LicenseRequest();
        req.setAssetId(payload.getAssetId());
        req.setAssetTitle(asset.getTitle());
        req.setCommunityName(asset.getCommunityName());
        req.setApplicantName(user.getUsername());
        req.setApplicantId(user.getId());
        
        req.setLicenseType(payload.getLicenseType());
        req.setPurpose(payload.getPurpose());
        req.setDocumentation(payload.getDocumentation());
        req.setDocumentationFileId(payload.getDocumentationFileId());
        req.setFee(payload.getFee());
        
        req.setFullName(payload.getFullName() != null ? payload.getFullName() : user.getUsername());
        req.setEmail(payload.getEmail() != null ? payload.getEmail() : user.getEmail());
        req.setPhone(payload.getPhone());
        req.setOrganizationName(payload.getOrganizationName());
        req.setGstNumber(payload.getGstNumber());
        req.setIntendedUse(payload.getIntendedUse());
        req.setBioKnowledgeDetails(payload.getBioKnowledgeDetails());
        
        req.setStatus("PENDING");
        req.setRequestDate(LocalDateTime.now().toString());
        req.setCreatedAt(LocalDateTime.now().toString());
        req.setUpdatedAt(LocalDateTime.now().toString());

        LicenseRequest saved = licenseRepository.save(req);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<LicenseRequest>> getMyRequests() {
        User user = getCurrentUser();
        return ResponseEntity.ok(licenseRepository.findByApplicantId(user.getId()));
    }

    @PatchMapping("/{id}/resubmit")
    public ResponseEntity<LicenseRequest> resubmitLicense(
            @PathVariable("id") String id, 
            @RequestBody Map<String, Object> body) {
        LicenseRequest req = licenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("License request not found"));

        if (body.containsKey("purpose")) {
            req.setPurpose((String) body.get("purpose"));
        }
        if (body.containsKey("documentation")) {
            req.setDocumentation((String) body.get("documentation"));
        }
        if (body.containsKey("fee")) {
            if (body.get("fee") instanceof Number) {
                req.setFee(((Number) body.get("fee")).doubleValue());
            }
        }
        req.setStatus("PENDING");
        req.setUpdatedAt(LocalDateTime.now().toString());

        LicenseRequest saved = licenseRepository.save(req);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/for-asset/{assetId}")
    public ResponseEntity<List<LicenseRequest>> getLicensesForAsset(@PathVariable("assetId") String assetId) {
        return ResponseEntity.ok(licenseRepository.findByAssetId(assetId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<LicenseRequest>> getPendingRequests() {
        return ResponseEntity.ok(licenseRepository.findByStatus("PENDING"));
    }

    @GetMapping("/all")
    public ResponseEntity<List<LicenseRequest>> getAllLicenses() {
        return ResponseEntity.ok(licenseRepository.findAll());
    }

    @GetMapping
    public ResponseEntity<List<LicenseRequest>> getRequestsByStatus(
            @RequestParam(value = "status", required = false) String status) {
        if (status != null && !status.isEmpty()) {
            return ResponseEntity.ok(licenseRepository.findByStatus(status));
        }
        return ResponseEntity.ok(licenseRepository.findAll());
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<LicenseRequest> approveLicense(@PathVariable("id") String id) {
        LicenseRequest req = licenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("License request not found"));

        req.setStatus("APPROVED");
        req.setUpdatedAt(LocalDateTime.now().toString());

        // Hash license details for cryptographic binding
        String dataToHash = req.getId() + req.getAssetId() + req.getApplicantName() + req.getLicenseType();
        String dataHash = sha256(dataToHash);

        // Commit to SHA-256 Ledger
        LedgerBlock block = ledgerService.commitRecord("LICENSE_GRANT", req.getId(), dataHash);
        req.setLedgerIndex(block.getIndex());

        LicenseRequest saved = licenseRepository.save(req);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<LicenseRequest> rejectLicense(
            @PathVariable("id") String id,
            @RequestBody Map<String, String> body) {
        LicenseRequest req = licenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("License request not found"));

        req.setStatus("REJECTED");
        req.setAdminComment(body.get("adminComment"));
        req.setUpdatedAt(LocalDateTime.now().toString());

        LicenseRequest saved = licenseRepository.save(req);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}/request-modification")
    public ResponseEntity<LicenseRequest> requestModification(
            @PathVariable("id") String id, 
            @RequestBody Map<String, String> body) {
        LicenseRequest req = licenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("License request not found"));

        req.setStatus("MODIFICATION_REQUIRED");
        req.setAdminComment(body.get("adminComment"));
        req.setUpdatedAt(LocalDateTime.now().toString());

        LicenseRequest saved = licenseRepository.save(req);
        return ResponseEntity.ok(saved);
    }

    private String sha256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
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
