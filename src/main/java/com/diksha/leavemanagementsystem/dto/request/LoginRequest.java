package com.diksha.leavemanagementsystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Username is required")
    @Size(min=4,max=20)
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min=8,max=20,message = "Password must be between 8 and 20 characters")
    @Pattern(
            regexp =
                    "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@#$%^&+=]).*$",

            message="Password must contain upper, lower, digit and special character"
    )
    private String password;

}