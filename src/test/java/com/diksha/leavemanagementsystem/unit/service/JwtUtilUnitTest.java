package com.diksha.leavemanagementsystem.unit.service;

import com.diksha.leavemanagementsystem.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilUnitTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() throws Exception {
        jwtUtil = new JwtUtil();

        // Inject secret via reflection (since @Value is not processed outside Spring context)
        Field secretField = JwtUtil.class.getDeclaredField("secret");
        secretField.setAccessible(true);
        secretField.set(jwtUtil, "ThisIsMyVerySecureSecretKeyForJwtAuthentication12345");

        Field expirationField = JwtUtil.class.getDeclaredField("jwtExpiration");
        expirationField.setAccessible(true);
        expirationField.set(jwtUtil, 86400000L);

        // Trigger @PostConstruct manually
        jwtUtil.init();
    }

    private UserDetails buildUserDetails(String username) {
        return User.withUsername(username)
                .password("irrelevant")
                .roles("EMPLOYEE")
                .build();
    }

    @Test
    void testGenerateToken_returnsNonNullToken() {
        UserDetails userDetails = buildUserDetails("testuser");
        String token = jwtUtil.generateToken(userDetails);
        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    void testExtractUsername_returnsCorrectUsername() {
        UserDetails userDetails = buildUserDetails("testuser");
        String token = jwtUtil.generateToken(userDetails);

        String extractedUsername = jwtUtil.extractUsername(token);

        assertEquals("testuser", extractedUsername);
    }

    @Test
    void testValidateToken_validTokenAndMatchingUser_returnsTrue() {
        UserDetails userDetails = buildUserDetails("testuser");
        String token = jwtUtil.generateToken(userDetails);

        assertTrue(jwtUtil.validateToken(token, userDetails));
    }

    @Test
    void testValidateToken_tokenForDifferentUser_returnsFalse() {
        UserDetails userDetails = buildUserDetails("testuser");
        UserDetails otherUser = buildUserDetails("otheruser");
        String token = jwtUtil.generateToken(userDetails);

        assertFalse(jwtUtil.validateToken(token, otherUser));
    }

    @Test
    void testValidateToken_tamperedToken_throwsException() {
        UserDetails userDetails = buildUserDetails("testuser");
        String token = jwtUtil.generateToken(userDetails);
        String tamperedToken = token.substring(0, token.length() - 5) + "XXXXX";

        assertThrows(Exception.class, () -> jwtUtil.validateToken(tamperedToken, userDetails));
    }

    @Test
    void testGenerateToken_differentUsersProduceDifferentTokens() {
        UserDetails user1 = buildUserDetails("alice");
        UserDetails user2 = buildUserDetails("bob");

        String token1 = jwtUtil.generateToken(user1);
        String token2 = jwtUtil.generateToken(user2);

        assertNotEquals(token1, token2);
    }
}
