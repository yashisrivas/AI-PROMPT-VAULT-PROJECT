package com.letsbuild.aipromptvault.repository;

import com.letsbuild.aipromptvault.entity.PromptCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CollectionRepo extends JpaRepository<PromptCollection, String> {
    List<PromptCollection> findByUserIdOrderByCreatedAtDesc(String userId);
}
