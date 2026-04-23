package com.letsbuild.aipromptvault.repository;

import com.letsbuild.aipromptvault.entity.Prompt;
import com.letsbuild.aipromptvault.enums.Visibility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface PromptRepo extends JpaRepository<Prompt,String> {

    @Transactional
    void deleteByUserId(String userId);

    List<Prompt> findByUserId(String userId);

    Page<Prompt> findByVisibilityOrderByCreatedAtDesc(Visibility visibility, Pageable pageable);

    @Query(value = "SELECT p FROM Prompt p WHERE p.visibility = :visibility")
    List<Prompt> findTrending(Visibility visibility);

    List<Prompt> findByUserIdAndVisibility(String userId, Visibility visibility);

    List<Prompt> findByTitleContainingIgnoreCase(String keyword);

    List<Prompt> findByContentContainingIgnoreCase(String keyword);

    List<Prompt> findByTagsContainingIgnoreCase(String keyword);

    @Query("SELECT DISTINCT p FROM Prompt p JOIN p.tags t WHERE p.visibility = :visibility AND p.userId != :userId AND p.id NOT IN :excludeIds AND t IN :tags")
    List<Prompt> findRecommendedPrompts(Visibility visibility, String userId, List<String> excludeIds, List<String> tags);

}
