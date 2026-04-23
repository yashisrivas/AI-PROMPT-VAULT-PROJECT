package com.letsbuild.aipromptvault.service;


import com.letsbuild.aipromptvault.dto.PublicFeedResponse;
import com.letsbuild.aipromptvault.dto.SignUpRequest;
import com.letsbuild.aipromptvault.dto.ViewCreator;
import com.letsbuild.aipromptvault.entity.Prompt;
import com.letsbuild.aipromptvault.entity.User;
import com.letsbuild.aipromptvault.enums.Visibility;
import com.letsbuild.aipromptvault.repository.PromptRepo;
import com.letsbuild.aipromptvault.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import com.letsbuild.aipromptvault.repository.FollowRepo;
import com.letsbuild.aipromptvault.entity.Follow;
import java.time.LocalDateTime;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepo userRepo;

    private final PromptRepo promptRepo;

    private final PasswordEncoder passwordEncoder;

    private final FollowRepo followRepo;

    public User saveUser(User user){
         return userRepo.save(user);
    }

    public User findByUsername(String username) {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User findById(String id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public void deleteUser(String username){

        User user = userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("user not found"));
        promptRepo.deleteByUserId(user.getId());
        userRepo.delete(user);

    }

    public void editUser(SignUpRequest editUser, String username){

        User user = userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("user not found"));

        if(editUser.getUsername()!=null){
            user.setUsername(editUser.getUsername());
        }

        if(editUser.getEmail()!=null){
            user.setEmail(editUser.getEmail());
        }

        if(editUser.getPassword()!=null){
            user.setPassword(passwordEncoder.encode(editUser.getPassword()));
        }

        userRepo.save(user);

    }






    @Transactional
    public void followUser(String followerUsername, String targetUsername) {
        if (followerUsername.equals(targetUsername)) {
            throw new RuntimeException("You cannot follow yourself");
        }

        User follower = findByUsername(followerUsername);
        User target = findByUsername(targetUsername);

        if (!followRepo.existsByFollowerIdAndFollowingId(follower.getId(), target.getId())) {
            Follow follow = Follow.builder()
                    .followerId(follower.getId())
                    .followingId(target.getId())
                    .createdAt(LocalDateTime.now())
                    .build();
            followRepo.save(follow);

            follower.setFollowing(follower.getFollowing() + 1);
            target.setFollowers(target.getFollowers() + 1);
            userRepo.save(follower);
            userRepo.save(target);
        }
    }

    @Transactional
    public void unfollowUser(String followerUsername, String targetUsername) {
        User follower = findByUsername(followerUsername);
        User target = findByUsername(targetUsername);

        followRepo.findByFollowerIdAndFollowingId(follower.getId(), target.getId())
                .ifPresent(follow -> {
                    followRepo.delete(follow);
                    follower.setFollowing(Math.max(0, follower.getFollowing() - 1));
                    target.setFollowers(Math.max(0, target.getFollowers() - 1));
                    userRepo.save(follower);
                    userRepo.save(target);
                });
    }

    public boolean isFollowing(String followerUsername, String targetUsername) {
        if (followerUsername == null || targetUsername == null) return false;
        try {
            User follower = findByUsername(followerUsername);
            User target = findByUsername(targetUsername);
            return followRepo.existsByFollowerIdAndFollowingId(follower.getId(), target.getId());
        } catch (Exception e) {
            return false;
        }
    }

}
