package com.letsbuild.aipromptvault.service;

import com.letsbuild.aipromptvault.entity.PromptCollection;
import com.letsbuild.aipromptvault.entity.User;
import com.letsbuild.aipromptvault.repository.CollectionRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CollectionService {

    private final CollectionRepo collectionRepo;
    private final UserService userService;
    private final com.letsbuild.aipromptvault.repository.PromptRepo promptRepo;

    public PromptCollection createCollection(String name, String description, String username) {
        User user = userService.findByUsername(username);
        PromptCollection collection = PromptCollection.builder()
                .name(name)
                .description(description)
                .userId(user.getId())
                .promptIds(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .build();
        return collectionRepo.save(collection);
    }

    public List<PromptCollection> getUserCollections(String username) {
        User user = userService.findByUsername(username);
        return collectionRepo.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public void addPromptToCollection(String collectionId, String promptId, String username) {
        User user = userService.findByUsername(username);
        PromptCollection collection = collectionRepo.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
        
        if (!collection.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (!collection.getPromptIds().contains(promptId)) {
            collection.getPromptIds().add(promptId);
            collectionRepo.save(collection);
        }
    }

    public void removePromptFromCollection(String collectionId, String promptId, String username) {
        User user = userService.findByUsername(username);
        PromptCollection collection = collectionRepo.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        if (!collection.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        collection.getPromptIds().remove(promptId);
        collectionRepo.save(collection);
    }

    public void deleteCollection(String collectionId, String username) {
        User user = userService.findByUsername(username);
        PromptCollection collection = collectionRepo.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
        
        if (!collection.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        collectionRepo.delete(collection);
    }

    public PromptCollection toggleVisibility(String collectionId, String username) {
        User user = userService.findByUsername(username);
        PromptCollection collection = collectionRepo.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        if (!collection.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        collection.setPublic(!collection.isPublic());
        return collectionRepo.save(collection);
    }

    public com.letsbuild.aipromptvault.dto.PublicCollectionDTO getPublicCollectionWithPrompts(String collectionId) {
        PromptCollection collection = collectionRepo.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
        if (!collection.isPublic()) {
            throw new RuntimeException("This collection is private");
        }
        
        User creator = userService.findById(collection.getUserId());
        List<com.letsbuild.aipromptvault.entity.Prompt> prompts = promptRepo.findAllById(collection.getPromptIds());

        return com.letsbuild.aipromptvault.dto.PublicCollectionDTO.builder()
                .id(collection.getId())
                .name(collection.getName())
                .description(collection.getDescription())
                .creatorUsername(creator.getUsername())
                .isPublic(collection.isPublic())
                .createdAt(collection.getCreatedAt())
                .prompts(prompts)
                .build();
    }
}
