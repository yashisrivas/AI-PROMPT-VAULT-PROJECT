package com.letsbuild.aipromptvault.controller;


import com.letsbuild.aipromptvault.dto.CreatePromptRequest;
import com.letsbuild.aipromptvault.dto.ViewPrompts;
import com.letsbuild.aipromptvault.entity.Prompt;
import com.letsbuild.aipromptvault.entity.User;
import com.letsbuild.aipromptvault.repository.PromptRepo;
import com.letsbuild.aipromptvault.repository.UserRepo;
import com.letsbuild.aipromptvault.service.PromptService;
import com.letsbuild.aipromptvault.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/prompt")
@RequiredArgsConstructor
@Slf4j
public class PromptController {

    private final PromptService promptService;

    private final UserRepo userRepo;

    private final UserService userService;

    @GetMapping("/view-prompts")
    public ResponseEntity<?> getUserPrompts(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        List<ViewPrompts> myPrompts = promptService.getMyPrompts(username);
        return new ResponseEntity<>(myPrompts != null ? myPrompts : List.of(), HttpStatus.OK);
    }

    @PostMapping("/create")
    public ResponseEntity<?> yourPrompt(@Valid @RequestBody CreatePromptRequest createPromptRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        try {
            com.letsbuild.aipromptvault.enums.Visibility visibility = createPromptRequest.getVisibility();
            if(visibility == null) visibility = com.letsbuild.aipromptvault.enums.Visibility.PRIVATE;

            Prompt newPrompt = Prompt.builder()
                    .title(createPromptRequest.getTitle())
                    .content(createPromptRequest.getContent())
                    .tags(createPromptRequest.getTags())
                    .userId(user.getId())
                    .likeCount(0)
                    .visibility(visibility)
                    .createdAt(LocalDateTime.now())
                    .build();

            Prompt saved = promptService.savePrompt(newPrompt);

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (Exception e) {
            log.error("Something went wrong while saving prompt", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Something went wrong");
        }
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<?> editPrompt(@PathVariable String id , @RequestBody CreatePromptRequest newPrompt){

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        promptService.editPrompt(id,username,newPrompt);

        return ResponseEntity.ok("Prompt updated successfully");

    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deletePrompt(@PathVariable String id){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        promptService.deletePrompt(id, username);

        return new ResponseEntity<>(HttpStatus.OK);

    }

    @GetMapping("/find")
    public ResponseEntity<?> finder(@RequestParam String keyword){

        return promptService.findButton(keyword);

    }

    @PostMapping("/fork/{id}")
    public ResponseEntity<?> forkPrompt(@PathVariable String id){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        try {
            Prompt forked = promptService.forkPrompt(id, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(forked);
        } catch (Exception e) {
            log.error("Failed to fork prompt", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fork prompt");
        }
    }
}
