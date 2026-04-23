package com.letsbuild.aipromptvault.entity;

import com.letsbuild.aipromptvault.enums.Visibility;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "prompts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Prompt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String title;

    private String content;

    @ElementCollection
    private List<String> tags;

    private String forkedFromId;

    private String userId;

    private Visibility visibility;

    private int likeCount;

    private int viewCount;

    private LocalDateTime createdAt;

}