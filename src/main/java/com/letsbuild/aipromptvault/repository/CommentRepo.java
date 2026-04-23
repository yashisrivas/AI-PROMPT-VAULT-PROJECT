package com.letsbuild.aipromptvault.repository;

import com.letsbuild.aipromptvault.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepo extends JpaRepository<Comment, String> {
    List<Comment> findByPromptIdOrderByCreatedAtDesc(String promptId);
    List<Comment> findByUserIdOrderByCreatedAtDesc(String userId);
}
