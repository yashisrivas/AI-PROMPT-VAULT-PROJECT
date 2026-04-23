package com.letsbuild.aipromptvault.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ViewPrompts {

    private String id;
    private String title;
    private String content;
    private String createdAt;
    private String tags;
    private Integer viewCount;
    private Integer likeCount;
    private com.letsbuild.aipromptvault.enums.Visibility visibility;
    private String category;
}
