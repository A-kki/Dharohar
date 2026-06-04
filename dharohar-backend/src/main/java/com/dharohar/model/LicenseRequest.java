package com.dharohar.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "license_requests")
public class LicenseRequest {
    @Id
    private String id;
    private String assetId;
    private String assetTitle;
    private String communityName;
    private String applicantName;
    private String applicantId;
    private String licenseType; // RESEARCH, COMMERCIAL, MEDIA, BIO_KNOWLEDGE
    private String purpose;
    private String documentation; // text url/path
    private String documentationFileId; // file path id
    private Double fee;
    
    // Detailed applicant profile info
    private String fullName;
    private String email;
    private String phone;
    private String organizationName;
    private String gstNumber;
    private String intendedUse;
    private String bioKnowledgeDetails;
    
    private String status; // PENDING, APPROVED, REJECTED, MODIFICATION_REQUIRED
    private String adminComment;
    private String agreementText;
    private String requestDate;
    private String createdAt;
    private String updatedAt;
    private Integer ledgerIndex; // Index in cryptochain ledger once approved

    public LicenseRequest() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAssetId() {
        return assetId;
    }

    public void setAssetId(String assetId) {
        this.assetId = assetId;
    }

    public String getAssetTitle() {
        return assetTitle;
    }

    public void setAssetTitle(String assetTitle) {
        this.assetTitle = assetTitle;
    }

    public String getCommunityName() {
        return communityName;
    }

    public void setCommunityName(String communityName) {
        this.communityName = communityName;
    }

    public String getApplicantName() {
        return applicantName;
    }

    public void setApplicantName(String applicantName) {
        this.applicantName = applicantName;
    }

    public String getApplicantId() {
        return applicantId;
    }

    public void setApplicantId(String applicantId) {
        this.applicantId = applicantId;
    }

    public String getLicenseType() {
        return licenseType;
    }

    public void setLicenseType(String licenseType) {
        this.licenseType = licenseType;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getDocumentation() {
        return documentation;
    }

    public void setDocumentation(String documentation) {
        this.documentation = documentation;
    }

    public String getDocumentationFileId() {
        return documentationFileId;
    }

    public void setDocumentationFileId(String documentationFileId) {
        this.documentationFileId = documentationFileId;
    }

    public Double getFee() {
        return fee;
    }

    public void setFee(Double fee) {
        this.fee = fee;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public String getGstNumber() {
        return gstNumber;
    }

    public void setGstNumber(String gstNumber) {
        this.gstNumber = gstNumber;
    }

    public String getIntendedUse() {
        return intendedUse;
    }

    public void setIntendedUse(String intendedUse) {
        this.intendedUse = intendedUse;
    }

    public String getBioKnowledgeDetails() {
        return bioKnowledgeDetails;
    }

    public void setBioKnowledgeDetails(String bioKnowledgeDetails) {
        this.bioKnowledgeDetails = bioKnowledgeDetails;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminComment() {
        return adminComment;
    }

    public void setAdminComment(String adminComment) {
        this.adminComment = adminComment;
    }

    public String getAgreementText() {
        return agreementText;
    }

    public void setAgreementText(String agreementText) {
        this.agreementText = agreementText;
    }

    public String getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(String requestDate) {
        this.requestDate = requestDate;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getLedgerIndex() {
        return ledgerIndex;
    }

    public void setLedgerIndex(Integer ledgerIndex) {
        this.ledgerIndex = ledgerIndex;
    }
}
