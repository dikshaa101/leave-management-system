package com.diksha.leavemanagementsystem.security;

import com.diksha.leavemanagementsystem.entity.Employee;
import com.diksha.leavemanagementsystem.repository.EmployeeRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final EmployeeRepository employeeRepository;
    private final JwtUtil jwtUtil;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        OAuth2User googleUser = (OAuth2User) authentication.getPrincipal();

        String email = googleUser.getAttribute("email");

        Employee employee = employeeRepository.findByEmailWithUser(email)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        UserDetails userDetails =
                org.springframework.security.core.userdetails.User
                        .builder()
                        .username(employee.getUser().getUsername())
                        .password(employee.getUser().getPassword())
                        .authorities(
                                "ROLE_" + employee.getUser().getRole().name()
                        )
                        .build();

        String jwt = jwtUtil.generateToken(userDetails);

        String redirectUrl =
                frontendUrl +
                        "/oauth2/success" +
                        "?token=" + URLEncoder.encode(jwt, StandardCharsets.UTF_8) +
                        "&username=" + URLEncoder.encode(employee.getUser().getUsername(), StandardCharsets.UTF_8) +
                        "&role=" + URLEncoder.encode(employee.getUser().getRole().name(), StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }
}