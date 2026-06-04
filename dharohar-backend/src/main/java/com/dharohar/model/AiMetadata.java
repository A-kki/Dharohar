package com.dharohar.model;

import java.util.List;

public class AiMetadata {
    private String domainClassification;
    private String riskTierSuggestion; // LOW, MEDIUM, HIGH
    private String suggestedLicenseType; // RESEARCH, COMMERCIAL, MEDIA
    private String summary;
    private Boolean sensitiveContentFlag;
    private List<String> keywords;

    public AiMetadata() {
    }

    public String getDomainClassification() {
        return domainClassification;
    }

    public void setDomainClassification(String domainClassification) {
        this.domainClassification = domainClassification;
    }

    public String getRiskTierSuggestion() {
        return riskTierSuggestion;
    }

    public void setRiskTierSuggestion(String riskTierSuggestion) {
        this.riskTierSuggestion = riskTierSuggestion;
    }

    public String getSuggestedLicenseType() {
        return suggestedLicenseType;
    }

    public void setSuggestedLicenseType(String suggestedLicenseType) {
        this.suggestedLicenseType = suggestedLicenseType;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public Boolean getSensitiveContentFlag() {
        return sensitiveContentFlag;
    }

    public void setSensitiveContentFlag(Boolean sensitiveContentFlag) {
        this.sensitiveContentFlag = sensitiveContentFlag;
    }

    public List<String> getKeywords() {
        return keywords;
    }

    public void setKeywords(List<String> keywords) {
        this.keywords = keywords;
    }
}
