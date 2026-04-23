package com.letsbuild.aipromptvault.controller;


import com.letsbuild.aipromptvault.dto.PublicFeedResponse;
import com.letsbuild.aipromptvault.dto.SignUpRequest;
import com.letsbuild.aipromptvault.dto.ViewCreator;
import com.letsbuild.aipromptvault.entity.Prompt;
import com.letsbuild.aipromptvault.entity.User;
import com.letsbuild.aipromptvault.enums.Role;
import com.letsbuild.aipromptvault.repository.PromptRepo;
import com.letsbuild.aipromptvault.repository.UserRepo;
import com.letsbuild.aipromptvault.security.SpringSecurity;
import com.letsbuild.aipromptvault.service.PromptService;
import com.letsbuild.aipromptvault.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicController {

    private final UserService userService;

    private final PasswordEncoder passwordEncoder;

    private final UserRepo userRepo;

    private final PromptService promptService;

    private final com.letsbuild.aipromptvault.service.CollectionService collectionService;

    @PostMapping("/sign-up")
    public ResponseEntity<?> signUp(@RequestBody SignUpRequest request){

        if(userRepo.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .enabled(true)
                .googleAccount(false)
                .createdAt(LocalDateTime.now())
                .build();

        userService.saveUser(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("User created successfully");
    }

    @GetMapping("/login")
    public ResponseEntity<?> login() {
        return ResponseEntity.ok("Login successful");
    }


    @GetMapping("/all-prompts")
    public ResponseEntity<?> allPublicPrompts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size){
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<PublicFeedResponse> publicPrompts = promptService.getPublicPrompts(pageable);

        return new ResponseEntity<>(publicPrompts, HttpStatus.OK);

    }

    @GetMapping("/trending")
    public ResponseEntity<?> trendingPrompts() {
        return ResponseEntity.ok(promptService.getTrendingPrompts());
    }

    @GetMapping("/download-prompt/{id}")
    public ResponseEntity<?> downloadPrompt(@PathVariable String id) {
        Prompt prompt = promptService.getPromptById(id);
        org.springframework.core.io.ByteArrayResource resource = new org.springframework.core.io.ByteArrayResource(prompt.getContent().getBytes());
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"prompt-" + prompt.getId() + ".txt\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @PostMapping("/view-count/{id}")
    public ResponseEntity<?> incrementViewCount(@PathVariable String id) {
        promptService.incrementView(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/view-creator/{username}")
    public ResponseEntity<ViewCreator> viewCreator(@PathVariable String username){

        ViewCreator viewcreator = promptService.viewcreator(username);

        return ResponseEntity.ok(viewcreator);
    }

    @GetMapping("/prompt/{id}/comments")
    public ResponseEntity<?> getPromptComments(@PathVariable String id) {
        return ResponseEntity.ok(promptService.getPromptComments(id));
    }

    @GetMapping("/collection/{id}")
    public ResponseEntity<?> getPublicCollection(@PathVariable String id) {
        try {
            return ResponseEntity.ok(collectionService.getPublicCollectionWithPrompts(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }
}
