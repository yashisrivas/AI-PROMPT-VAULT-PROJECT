package com.letsbuild.aipromptvault.controller;


import com.letsbuild.aipromptvault.dto.SignUpRequest;
import com.letsbuild.aipromptvault.entity.User;
import com.letsbuild.aipromptvault.repository.UserRepo;
import com.letsbuild.aipromptvault.service.UserService;
import com.letsbuild.aipromptvault.service.PromptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private final UserRepo userRepo;

    private final PromptService promptService;


    @DeleteMapping("/delete-user")
    public ResponseEntity<?> deleteUser(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        userService.deleteUser(username);

        return new ResponseEntity<>(HttpStatus.OK);

    }

    @PutMapping("/edit-user")
    public ResponseEntity<?> editUser(@RequestBody SignUpRequest editUser){

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        userService.editUser(editUser,username);

        return new ResponseEntity<>(HttpStatus.OK);


    }

    @PostMapping("/follow/{targetUsername}")
    public ResponseEntity<?> followUser(@PathVariable String targetUsername) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        userService.followUser(username, targetUsername);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/unfollow/{targetUsername}")
    public ResponseEntity<?> unfollowUser(@PathVariable String targetUsername) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        userService.unfollowUser(username, targetUsername);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/comment/{promptId}")
    public ResponseEntity<?> comment(@PathVariable String promptId, @RequestBody java.util.Map<String, String> request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String content = request.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Comment content cannot be empty.");
        }
        promptService.addComment(promptId, username, content);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/prompt/{promptId}/like")
    public ResponseEntity<?> toggleLike(@PathVariable String promptId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        promptService.toggleLike(promptId, username);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/saved-prompts")
    public ResponseEntity<?> getSavedPrompts() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(promptService.getSavedPrompts(username));
    }

    @GetMapping("/recommended-prompts")
    public ResponseEntity<?> getRecommendedPrompts() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(promptService.getRecommendedPrompts(username));
    }

}
