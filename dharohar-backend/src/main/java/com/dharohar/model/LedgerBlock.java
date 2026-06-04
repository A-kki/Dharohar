package com.dharohar.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "ledger_blocks")
public class LedgerBlock {
    @Id
    private String id;
    private Integer index;
    private String timestamp;
    private String entityType; // ASSET, LICENSE
    private String entityId;
    private String dataHash; // Hash of the metadata body
    private String prevHash; // Hash of previous block
    private String hash; // Hash of current block: SHA256(index + timestamp + entityId + dataHash + prevHash)
    private String signature; // Verification signature

    public LedgerBlock() {
    }

    public LedgerBlock(String id, Integer index, String timestamp, String entityType, String entityId, String dataHash, String prevHash, String hash, String signature) {
        this.id = id;
        this.index = index;
        this.timestamp = timestamp;
        this.entityType = entityType;
        this.entityId = entityId;
        this.dataHash = dataHash;
        this.prevHash = prevHash;
        this.hash = hash;
        this.signature = signature;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Integer getIndex() {
        return index;
    }

    public void setIndex(Integer index) {
        this.index = index;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public String getDataHash() {
        return dataHash;
    }

    public void setDataHash(String dataHash) {
        this.dataHash = dataHash;
    }

    public String getPrevHash() {
        return prevHash;
    }

    public void setPrevHash(String prevHash) {
        this.prevHash = prevHash;
    }

    public String getHash() {
        return hash;
    }

    public void setHash(String hash) {
        this.hash = hash;
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }
}
