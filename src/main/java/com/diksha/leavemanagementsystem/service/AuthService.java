package com.diksha.leavemanagementsystem.service;

import com.diksha.leavemanagementsystem.dto.request.LoginRequest;
import com.diksha.leavemanagementsystem.dto.request.RegisterRequest;
import com.diksha.leavemanagementsystem.dto.response.JwtResponse;
import com.diksha.leavemanagementsystem.entity.User;
import com.diksha.leavemanagementsystem.repository.UserRepository;
import com.diksha.leavemanagementsystem.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    private final JwtUtil jwtUtil;

    private final UserDetailsService userDetailsService;

    public String register(RegisterRequest request) {

        if(userRepository.existsByUsername(request.getUsername())){

            throw new RuntimeException("Username already exists");

        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        userRepository.save(user);

        return "User Registered Successfully";

    }

    public JwtResponse login(LoginRequest request){

        authenticationManager.authenticate(

                new UsernamePasswordAuthenticationToken(

                        request.getUsername(),

                        request.getPassword()

                )

        );

        UserDetails userDetails =

                userDetailsService.loadUserByUsername(
                        request.getUsername()
                );

        String token = jwtUtil.generateToken(userDetails);

        return new JwtResponse(token);

    }

}