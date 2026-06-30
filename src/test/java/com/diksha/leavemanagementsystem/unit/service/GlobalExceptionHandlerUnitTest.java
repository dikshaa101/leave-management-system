package com.diksha.leavemanagementsystem.unit.service;

import com.diksha.leavemanagementsystem.exception.GlobalExceptionHandler;
import com.diksha.leavemanagementsystem.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerUnitTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void testHandleRuntimeException_returnsBadRequest() {
        RuntimeException ex = new RuntimeException("Something went wrong");
        ResponseEntity<String> response = handler.handleRuntime(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Something went wrong", response.getBody());
    }

    @Test
    void testHandleBadCredentials_returnsUnauthorized() {
        BadCredentialsException ex = new BadCredentialsException("Bad creds");
        ResponseEntity<String> response = handler.handleBadCredentials(ex);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid Username or Password", response.getBody());
    }

    @Test
    void testHandleResourceNotFound_returnsNotFound() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Employee not found");
        ResponseEntity<String> response = handler.handleResourceNotFound(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Employee not found", response.getBody());
    }

    @Test
    void testHandleValidation_returnsBadRequestWithFieldMessage() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("obj", "startDate", "Start date is required");

        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldError()).thenReturn(fieldError);

        ResponseEntity<String> response = handler.handleValidation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Start date is required", response.getBody());
    }
}
