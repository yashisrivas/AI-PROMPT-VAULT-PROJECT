package com.letsbuild.aipromptvault.dto;

import com.letsbuild.aipromptvault.enums.Visibility;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class CreatePromptRequest {

    @NotBlank(message = "cannot be empty")
    private String title;

    @NotBlank(message = "cannot be empty")
    private String content;

    private List<String> tags;

    @jakarta.validation.constraints.NotNull(message = "cannot be empty")
    private Visibility visibility;

}
