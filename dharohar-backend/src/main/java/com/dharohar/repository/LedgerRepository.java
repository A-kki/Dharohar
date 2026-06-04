package com.dharohar.repository;

import com.dharohar.model.LedgerBlock;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface LedgerRepository extends MongoRepository<LedgerBlock, String> {
    Optional<LedgerBlock> findFirstByOrderByIndexDesc();
}
