package com.bookora.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handle(
        ResponseStatusException exception
    ) {
        return ResponseEntity
            .status(exception.getStatusCode())
            .body(Map.of(
                "message",
                exception.getReason() == null
                    ? "Request failed"
                    : exception.getReason()
            ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> validation(
        MethodArgumentNotValidException exception
    ) {
        var error = exception.getBindingResult()
            .getFieldError();

        String message = error == null
            ? "Invalid request"
            : error.getField() + ": " + error.getDefaultMessage();

        return ResponseEntity.badRequest()
            .body(Map.of("message", message));
    }
}
