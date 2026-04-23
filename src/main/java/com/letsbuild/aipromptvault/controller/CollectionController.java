package com.letsbuild.aipromptvault.controller;

import com.letsbuild.aipromptvault.service.CollectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/user/collection")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService collectionService;

    @PostMapping("/create")
    public ResponseEntity<?> createCollection(@RequestBody Map<String, String> request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String name = request.get("name");
        String desc = request.get("description");
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Name is required");
        }
        return new ResponseEntity<>(collectionService.createCollection(name, desc, username), HttpStatus.CREATED);
    }

    @GetMapping("/my-collections")
    public ResponseEntity<?> getMyCollections() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(collectionService.getUserCollections(username));
    }

    @PostMapping("/{collectionId}/add/{promptId}")
    public ResponseEntity<?> addPrompt(@PathVariable String collectionId, @PathVariable String promptId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        collectionService.addPromptToCollection(collectionId, promptId, username);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/{collectionId}/remove/{promptId}")
    public ResponseEntity<?> removePrompt(@PathVariable String collectionId, @PathVariable String promptId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        collectionService.removePromptFromCollection(collectionId, promptId, username);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/{collectionId}")
    public ResponseEntity<?> deleteCollection(@PathVariable String collectionId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        collectionService.deleteCollection(collectionId, username);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping("/{collectionId}/visibility")
    public ResponseEntity<?> toggleVisibility(@PathVariable String collectionId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            return ResponseEntity.ok(collectionService.toggleVisibility(collectionId, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }
}
