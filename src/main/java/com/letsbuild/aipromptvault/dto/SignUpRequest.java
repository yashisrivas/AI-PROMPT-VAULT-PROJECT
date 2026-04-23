package com.letsbuild.aipromptvault.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignUpRequest {

    @NotBlank(message = "cannot be empty")
    private String username;

    @NotBlank(message = "cannot be empty")
    private String email;

    private String password;

}
