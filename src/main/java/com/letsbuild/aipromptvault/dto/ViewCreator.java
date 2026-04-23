package com.letsbuild.aipromptvault.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Builder
@Getter
@Setter
public class ViewCreator {

    private String username;
    private int followers;
    private int following;
    private boolean isFollowing;
    private List<PublicFeedResponse> prompts;
    private List<com.letsbuild.aipromptvault.entity.Comment> comments;
}
