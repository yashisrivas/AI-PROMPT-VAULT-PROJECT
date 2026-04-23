package com.letsbuild.aipromptvault.dto;

import com.letsbuild.aipromptvault.entity.Prompt;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PublicCollectionDTO {
    private String id;
    private String name;
    private String description;
    private String creatorUsername;
    private boolean isPublic;
    private LocalDateTime createdAt;
    private List<Prompt> prompts;
}
