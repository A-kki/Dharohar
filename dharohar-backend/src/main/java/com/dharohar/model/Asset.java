package com.dharohar.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "assets")
public class Asset {
    @Id
    private String id;
    private String title;
    private String description;
    private String createdBy; // User ID
    private String communityName;
    private String tribalMember; // Name of contributor
    
    private String type; // BIO or SONIC
    
    // BIO-specific properties
    private String category; // MEDICINAL, AGRICULTURAL, ECOLOGICAL, RITUAL
    private String scientificName; // Translated plant name
    private String ailmentTargeted;
    private List<String> activeConstituents;
    private String preparationMethod; // Sanitized (no precise dosages)
    private String clinicalSafetyFlag; // Warning flag if toxic
    
    // SONIC-specific properties
    private String performanceContext; // FESTIVAL, RITUAL, AGRICULTURAL, CELEBRATION
    private String lyrics;
    private String culturalMeaning;
    private String fingerprint; // Audio MFCC / content signature
    
    // Core details
    private String mediaUrl; // Serving path
    private String mediaFileId; // Raw file identifier or URL
    private String localFilePath; // Disk path
    private String transcript;
    private String location; // GPS Coordinates
    private String timestamp;
    
    private String approvalStatus; // PENDING, APPROVED, REJECTED
    private String reviewComment; // Reject comments
    private String contentHash; // SHA-256 hash of media file
    private Integer ledgerIndex; // Index in cryptochain ledger
    private String riskTier;
    private Boolean aiProcessed;
    private AiMetadata aiMetadata;

    public Asset() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getCommunityName() {
        return communityName;
    }

    public void setCommunityName(String communityName) {
        this.communityName = communityName;
    }

    public String getTribalMember() {
        return tribalMember;
    }

    public void setTribalMember(String tribalMember) {
        this.tribalMember = tribalMember;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getScientificName() {
        return scientificName;
    }

    public void setScientificName(String scientificName) {
        this.scientificName = scientificName;
    }

    public String getAilmentTargeted() {
        return ailmentTargeted;
    }

    public void setAilmentTargeted(String ailmentTargeted) {
        this.ailmentTargeted = ailmentTargeted;
    }

    public List<String> getActiveConstituents() {
        return activeConstituents;
    }

    public void setActiveConstituents(List<String> activeConstituents) {
        this.activeConstituents = activeConstituents;
    }

    public String getPreparationMethod() {
        return preparationMethod;
    }

    public void setPreparationMethod(String preparationMethod) {
        this.preparationMethod = preparationMethod;
    }

    public String getClinicalSafetyFlag() {
        return clinicalSafetyFlag;
    }

    public void setClinicalSafetyFlag(String clinicalSafetyFlag) {
        this.clinicalSafetyFlag = clinicalSafetyFlag;
    }

    public String getPerformanceContext() {
        return performanceContext;
    }

    public void setPerformanceContext(String performanceContext) {
        this.performanceContext = performanceContext;
    }

    public String getLyrics() {
        return lyrics;
    }

    public void setLyrics(String lyrics) {
        this.lyrics = lyrics;
    }

    public String getCulturalMeaning() {
        return culturalMeaning;
    }

    public void setCulturalMeaning(String culturalMeaning) {
        this.culturalMeaning = culturalMeaning;
    }

    public String getFingerprint() {
        return fingerprint;
    }

    public void setFingerprint(String fingerprint) {
        this.fingerprint = fingerprint;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public String getLocalFilePath() {
        return localFilePath;
    }

    public void setLocalFilePath(String localFilePath) {
        this.localFilePath = localFilePath;
    }

    public String getTranscript() {
        return transcript;
    }

    public void setTranscript(String transcript) {
        this.transcript = transcript;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getCreatedAt() {
        return timestamp;
    }

    public void setCreatedAt(String createdAt) {
        this.timestamp = createdAt;
    }

    public String getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public String getReviewComment() {
        return reviewComment;
    }

    public void setReviewComment(String reviewComment) {
        this.reviewComment = reviewComment;
    }

    public String getContentHash() {
        return contentHash;
    }

    public void setContentHash(String contentHash) {
        this.contentHash = contentHash;
    }

    public Integer getLedgerIndex() {
        return ledgerIndex;
    }

    public void setLedgerIndex(Integer ledgerIndex) {
        this.ledgerIndex = ledgerIndex;
    }

    public String getRiskTier() {
        return riskTier;
    }

    public void setRiskTier(String riskTier) {
        this.riskTier = riskTier;
    }

    public String getMediaFileId() {
        return mediaFileId;
    }

    public void setMediaFileId(String mediaFileId) {
        this.mediaFileId = mediaFileId;
    }

    public Boolean getAiProcessed() {
        return aiProcessed;
    }

    public void setAiProcessed(Boolean aiProcessed) {
        this.aiProcessed = aiProcessed;
    }

    public AiMetadata getAiMetadata() {
        return aiMetadata;
    }

    public void setAiMetadata(AiMetadata aiMetadata) {
        this.aiMetadata = aiMetadata;
    }
}
