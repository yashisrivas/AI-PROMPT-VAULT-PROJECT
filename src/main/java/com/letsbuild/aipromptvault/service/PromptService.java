package com.letsbuild.aipromptvault.service;

import com.letsbuild.aipromptvault.dto.*;
import com.letsbuild.aipromptvault.entity.Prompt;
import com.letsbuild.aipromptvault.entity.User;
import com.letsbuild.aipromptvault.enums.Visibility;
import com.letsbuild.aipromptvault.repository.PromptRepo;
import com.letsbuild.aipromptvault.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.letsbuild.aipromptvault.repository.CommentRepo;
import com.letsbuild.aipromptvault.entity.Comment;
import com.letsbuild.aipromptvault.repository.PromptLikeRepo;
import com.letsbuild.aipromptvault.entity.PromptLike;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class PromptService {

    private final UserRepo userRepo;

    private final PromptRepo promptRepo;

    private final UserService userService;

    private final CommentRepo commentRepo;

    private final PromptLikeRepo promptLikeRepo;




    public Prompt savePrompt(Prompt prompt){
        return promptRepo.save(prompt);
    }

    private ViewPrompts convertToDto(Prompt prompt) {

        return ViewPrompts.builder()
                .id(prompt.getId())
                .title(prompt.getTitle())
                .content(prompt.getContent())
                .tags(prompt.getTags() != null ? prompt.getTags().toString() : "")
                .createdAt(prompt.getCreatedAt().toString())
                .viewCount(prompt.getViewCount())
                .likeCount(prompt.getLikeCount())
                .visibility(prompt.getVisibility())
                .build();
    }

    public List<ViewPrompts> getMyPrompts(String username){

        User user = userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("user not found"));

        List<Prompt> myPrompts = promptRepo.findByUserId(user.getId());

        return myPrompts.stream()
                .map(this::convertToDto)
                .toList();

    }

    public void editPrompt(String promptId , String username , CreatePromptRequest newPrompt){

        User user = userService.findByUsername(username);

        Prompt prompt = promptRepo.findById(promptId)
                .orElseThrow(() -> new RuntimeException("Prompt not found"));

        if(!prompt.getUserId().equals(user.getId())){
           throw new RuntimeException("you are not allowed to edit this prompt");
        }else{


            if(newPrompt.getTitle()!=null){
                prompt.setTitle(newPrompt.getTitle());
            }

            if(newPrompt.getTags()!=null){
                prompt.setTags(newPrompt.getTags());
            }

            if(newPrompt.getContent()!=null){
                prompt.setContent(newPrompt.getContent());
            }

            prompt.setCreatedAt(LocalDateTime.now());

            promptRepo.save(prompt);

        }



    }

    public void deletePrompt(String id, String username){

        User user = userService.findByUsername(username);
        Prompt prompt = promptRepo.findById(id).orElseThrow(() -> new RuntimeException("prompt not found"));

        if(!prompt.getUserId().equals(user.getId())){
             throw new RuntimeException("you are not allowed to delete this prompt");
        }

        promptRepo.deleteById(prompt.getId());
    }

    public org.springframework.data.domain.Page<PublicFeedResponse> getPublicPrompts(org.springframework.data.domain.Pageable pageable) {

        org.springframework.data.domain.Page<Prompt> page = promptRepo.findByVisibilityOrderByCreatedAtDesc(Visibility.PUBLIC, pageable);

        return page.map(this::convertToPublicDto);
    }

    public Prompt getPromptById(String id) {
        return promptRepo.findById(id).orElseThrow(() -> new RuntimeException("Prompt not found"));
    }

    public List<PublicFeedResponse> getTrendingPrompts() {
        List<Prompt> prompts = promptRepo.findTrending(Visibility.PUBLIC);
        
        return prompts.stream()
            .sorted((p1, p2) -> {
                double score1 = calculateTrendingScore(p1);
                double score2 = calculateTrendingScore(p2);
                return Double.compare(score2, score1);
            })
            .limit(5)
            .map(this::convertToPublicDto)
            .toList();
    }

    private double calculateTrendingScore(Prompt p) {
        long hours = java.time.Duration.between(p.getCreatedAt(), LocalDateTime.now()).toHours();
        if (hours == 0) hours = 1;
        return (p.getLikeCount() * 2.0 + p.getViewCount()) / hours;
    }

    public Prompt forkPrompt(String originalId, String username) {
        User user = userService.findByUsername(username);
        Prompt original = promptRepo.findById(originalId)
            .orElseThrow(() -> new RuntimeException("Original prompt not found"));
        
        Prompt copy = Prompt.builder()
            .title(original.getTitle() + " (Fork)")
            .content(original.getContent())
            .tags(original.getTags() != null ? new java.util.ArrayList<>(original.getTags()) : new java.util.ArrayList<>())
            .userId(user.getId())
            .visibility(original.getVisibility())
            .forkedFromId(original.getId())
            .createdAt(LocalDateTime.now())
            .likeCount(0)
            .viewCount(0)
            .build();
            
        return promptRepo.save(copy);
    }

    private PublicFeedResponse convertToPublicDto(Prompt prompt) {

        User user = userRepo.findById(prompt.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isLiked = false;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            User reqUser = userRepo.findByUsername(auth.getName()).orElse(null);
            if (reqUser != null) {
                isLiked = promptLikeRepo.existsByUserIdAndPromptId(reqUser.getId(), prompt.getId());
            }
        }

        return PublicFeedResponse.builder()
                .id(prompt.getId())
                .title(prompt.getTitle())
                .username(user.getUsername())
                .likeCount(prompt.getLikeCount())
                .viewCount(prompt.getViewCount())
                .createdAt(prompt.getCreatedAt())
                .content(prompt.getContent())
                .tags(prompt.getTags())
                .isLiked(isLiked)
                .build();
    }

    public ViewCreator viewcreator(String username){

        User user = userService.findByUsername(username);
        String userId = user.getId();

        List<Prompt> byUserIdAndVisibility = promptRepo.findByUserIdAndVisibility(userId, Visibility.PUBLIC);

        List<PublicFeedResponse> promptDtos =
                byUserIdAndVisibility.stream()
                        .map(this::convertToPublicDto)
                        .toList();

        List<Comment> comments = commentRepo.findByUserIdOrderByCreatedAtDesc(userId);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isFollowing = false;
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            isFollowing = userService.isFollowing(auth.getName(), username);
        }

        return ViewCreator.builder()
                .username(user.getUsername())
                .followers(user.getFollowers())
                .following(user.getFollowing())
                .isFollowing(isFollowing)
                .prompts(promptDtos)
                .comments(comments)
                .build();
    }

    public void addComment(String promptId, String username, String content) {
        User user = userService.findByUsername(username);
        Prompt prompt = promptRepo.findById(promptId).orElseThrow(() -> new RuntimeException("Prompt not found"));

        Comment comment = Comment.builder()
                .promptId(promptId)
                .userId(user.getId())
                .username(user.getUsername())
                .content(content)
                .createdAt(LocalDateTime.now())
                .build();
        commentRepo.save(comment);
    }

    public List<Comment> getPromptComments(String promptId) {
        return commentRepo.findByPromptIdOrderByCreatedAtDesc(promptId);
    }

    public PromptSearchDto convertToPromptSearchDto(Prompt prompt){

        return PromptSearchDto.builder()
                .title(prompt.getTitle())
                .content(prompt.getContent())
                .tags(prompt.getTags())
                .build();

    }

    public UserSearchDto convertToUserSearchDto(User user){

        return UserSearchDto.builder()
                .username(user.getUsername())
                .build();

    }

    public ResponseEntity findButton(String keyword){

        List<Prompt> content = promptRepo.findByContentContainingIgnoreCase(keyword);
        List<Prompt> title = promptRepo.findByTitleContainingIgnoreCase(keyword);
        List<Prompt> tags = promptRepo.findByTagsContainingIgnoreCase(keyword);
        List<User> username = userRepo.findByUsernameContainingIgnoreCase(keyword);

        List<PromptSearchDto> contentDto = content.stream().map(this::convertToPromptSearchDto).toList();
        List<PromptSearchDto> titleDto = title.stream().map(this::convertToPromptSearchDto).toList();
        List<PromptSearchDto> tagsDto = tags.stream().map(this::convertToPromptSearchDto).toList();

        List<UserSearchDto> usernameDto = username.stream().map(this::convertToUserSearchDto).toList();

        HashMap<String,Object> result = new HashMap<>();

        result.put("Content Matches" , contentDto);
        result.put("Title Matches" , titleDto);
        result.put("username Matches" , usernameDto);
        result.put("Tags Matches" , tagsDto);

        return ResponseEntity.ok(result);

    }




    public void incrementView(String id) {
        promptRepo.findById(id).ifPresent(p -> {
            p.setViewCount(p.getViewCount() + 1);
            promptRepo.save(p);
        });
    }

    public void toggleLike(String promptId, String username) {
        User user = userService.findByUsername(username);
        Prompt prompt = promptRepo.findById(promptId).orElseThrow(() -> new RuntimeException("Prompt not found"));

        Optional<PromptLike> existingLike = promptLikeRepo.findByUserIdAndPromptId(user.getId(), promptId);
        
        if (existingLike.isPresent()) {
            promptLikeRepo.delete(existingLike.get());
            prompt.setLikeCount(Math.max(0, prompt.getLikeCount() - 1));
        } else {
            PromptLike like = PromptLike.builder()
                    .userId(user.getId())
                    .promptId(promptId)
                    .createdAt(LocalDateTime.now())
                    .build();
            promptLikeRepo.save(like);
            prompt.setLikeCount(prompt.getLikeCount() + 1);
        }
        promptRepo.save(prompt);
    }

    public List<PublicFeedResponse> getSavedPrompts(String username) {
        User user = userService.findByUsername(username);
        List<PromptLike> likes = promptLikeRepo.findByUserIdOrderByCreatedAtDesc(user.getId());
        
        return likes.stream()
                .map(like -> promptRepo.findById(like.getPromptId()).orElse(null))
                .filter(Objects::nonNull)
                .map(this::convertToPublicDto)
                .toList();
    }

    public List<PublicFeedResponse> getRecommendedPrompts(String username) {
        User user = userService.findByUsername(username);
        List<Prompt> myPrompts = promptRepo.findByUserId(user.getId());
        List<PromptLike> myLikes = promptLikeRepo.findByUserIdOrderByCreatedAtDesc(user.getId());
        
        List<String> excludeIds = new ArrayList<>();
        myPrompts.forEach(p -> excludeIds.add(p.getId()));
        myLikes.forEach(l -> excludeIds.add(l.getPromptId()));
        if (excludeIds.isEmpty()) excludeIds.add("dummy-id");

        Map<String, Integer> tagCounts = new HashMap<>();
        
        for (Prompt p : myPrompts) {
            if (p.getTags() != null) {
                p.getTags().forEach(t -> tagCounts.put(t.toLowerCase(), tagCounts.getOrDefault(t.toLowerCase(), 0) + 1));
            }
        }
        for (PromptLike l : myLikes) {
            Prompt p = promptRepo.findById(l.getPromptId()).orElse(null);
            if (p != null && p.getTags() != null) {
                p.getTags().forEach(t -> tagCounts.put(t.toLowerCase(), tagCounts.getOrDefault(t.toLowerCase(), 0) + 1));
            }
        }
        
        List<String> topTags = tagCounts.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(5)
                .map(Map.Entry::getKey)
                .toList();

        if (topTags.isEmpty()) {
            return List.of(); 
        }

        List<Prompt> recommendations = promptRepo.findRecommendedPrompts(Visibility.PUBLIC, user.getId(), excludeIds, topTags);
        
        return recommendations.stream()
                .limit(10)
                .map(this::convertToPublicDto)
                .toList();
    }
}
