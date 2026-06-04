package com.dharohar.repository;

import com.dharohar.model.LicenseRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface LicenseRequestRepository extends MongoRepository<LicenseRequest, String> {
    List<LicenseRequest> findByStatus(String status);
    List<LicenseRequest> findByApplicantId(String applicantId);
    List<LicenseRequest> findByAssetId(String assetId);
}

