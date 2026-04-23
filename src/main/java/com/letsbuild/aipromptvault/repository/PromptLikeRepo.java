package com.letsbuild.aipromptvault.repository;

import com.letsbuild.aipromptvault.entity.PromptLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromptLikeRepo extends JpaRepository<PromptLike, String> {
    Optional<PromptLike> findByUserIdAndPromptId(String userId, String promptId);
    boolean existsByUserIdAndPromptId(String userId, String promptId);
    List<PromptLike> findByUserIdOrderByCreatedAtDesc(String userId);
    void deleteByPromptId(String promptId);
} 
