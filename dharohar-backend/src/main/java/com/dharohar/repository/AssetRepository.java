package com.dharohar.repository;

import com.dharohar.model.Asset;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface AssetRepository extends MongoRepository<Asset, String> {
    List<Asset> findByCreatedBy(String createdBy);
    List<Asset> findByApprovalStatus(String approvalStatus);
    List<Asset> findByApprovalStatusIgnoreCase(String approvalStatus);
    Optional<Asset> findByMediaFileId(String mediaFileId);
    Optional<Asset> findByMediaFileIdContaining(String mediaFileId);
}
