package com.letsbuild.aipromptvault.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@Getter
@Setter
public class PublicFeedResponse {

    private String id;
    private String title;
    private String content;
    private List<String> tags;
    private String username;
    private int likeCount;
    private int viewCount;
    private LocalDateTime createdAt;
    private boolean isLiked;


}
