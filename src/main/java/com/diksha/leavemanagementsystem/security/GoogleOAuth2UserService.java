package com.diksha.leavemanagementsystem.security;

import com.diksha.leavemanagementsystem.entity.Employee;
import com.diksha.leavemanagementsystem.entity.User;
import com.diksha.leavemanagementsystem.repository.EmployeeRepository;
import com.diksha.leavemanagementsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class GoogleOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest)
            throws OAuth2AuthenticationException {

        System.out.println("========== GoogleOAuth2UserService ==========");

        OAuth2User googleUser =
                new DefaultOAuth2UserService().loadUser(userRequest);

        String email = googleUser.getAttribute("email");
        System.out.println("Google Email: " + email);

        Employee employee = employeeRepository.findByEmailWithUser(email)
                .orElseThrow(() -> {
                    System.out.println("Employee NOT FOUND!");
                    return new OAuth2AuthenticationException(
                            "This email is not registered by your company."
                    );
                });

        System.out.println("Employee Found: " + employee.getEmail());
        System.out.println("Username: " + employee.getUser().getUsername());

        User user = employee.getUser();

        return new DefaultOAuth2User(
                Collections.singleton(
                        new SimpleGrantedAuthority(
                                "ROLE_" + user.getRole().name()
                        )
                ),
                googleUser.getAttributes(),
                "email"
        );
    }
}