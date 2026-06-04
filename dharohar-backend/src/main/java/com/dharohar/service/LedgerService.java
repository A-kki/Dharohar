package com.dharohar.service;

import com.dharohar.model.LedgerBlock;
import com.dharohar.repository.LedgerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Optional;

@Service
public class LedgerService {

    @Autowired
    private LedgerRepository ledgerRepository;

    public synchronized LedgerBlock commitRecord(String entityType, String entityId, String dataHash) {
        Optional<LedgerBlock> latestBlockOpt = ledgerRepository.findFirstByOrderByIndexDesc();
        
        int nextIndex = 1;
        String prevHash = "0000000000000000000000000000000000000000000000000000000000000000"; // Genesis block default
        
        if (latestBlockOpt.isPresent()) {
            LedgerBlock latest = latestBlockOpt.get();
            nextIndex = latest.getIndex() + 1;
            prevHash = latest.getHash();
        }

        String timestamp = Instant.now().toString();
        String currentHash = calculateBlockHash(nextIndex, timestamp, entityId, dataHash, prevHash);

        LedgerBlock block = new LedgerBlock();
        block.setIndex(nextIndex);
        block.setTimestamp(timestamp);
        block.setEntityType(entityType);
        block.setEntityId(entityId);
        block.setDataHash(dataHash);
        block.setPrevHash(prevHash);
        block.setHash(currentHash);
        block.setSignature("DHAROHAR-SOVEREIGN-PROOF-SIG-SHA256");

        return ledgerRepository.save(block);
    }

    private String calculateBlockHash(int index, String timestamp, String entityId, String dataHash, String prevHash) {
        String dataToHash = index + timestamp + entityId + dataHash + prevHash;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(dataToHash.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }
    
    public boolean verifyLedgerIntegrity() {
        var blocks = ledgerRepository.findAll();
        for (int i = 1; i < blocks.size(); i++) {
            LedgerBlock current = blocks.get(i);
            LedgerBlock previous = blocks.get(i - 1);
            
            // Check hash links
            if (!current.getPrevHash().equals(previous.getHash())) {
                return false;
            }
            
            // Check current block's hash matches recalculation
            String recalculatedHash = calculateBlockHash(
                current.getIndex(), 
                current.getTimestamp(), 
                current.getEntityId(), 
                current.getDataHash(), 
                current.getPrevHash()
            );
            if (!current.getHash().equals(recalculatedHash)) {
                return false;
            }
        }
        return true;
    }
}
