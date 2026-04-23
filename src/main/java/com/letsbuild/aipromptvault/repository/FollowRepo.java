package com.letsbuild.aipromptvault.repository;

import com.letsbuild.aipromptvault.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FollowRepo extends JpaRepository<Follow, String> {
    boolean existsByFollowerIdAndFollowingId(String followerId, String followingId);
    Optional<Follow> findByFollowerIdAndFollowingId(String followerId, String followingId);
    int countByFollowerId(String followerId);
    int countByFollowingId(String followingId);
}
