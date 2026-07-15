package com.campuscare.controller;

import com.campuscare.dto.ChangePasswordRequest;
import com.campuscare.dto.ChangePasswordResponse;
import com.campuscare.dto.LoginRequest;
import com.campuscare.dto.LoginResponse;
import com.campuscare.dto.RegisterRequest;
import com.campuscare.dto.UserLookupResponse;
import com.campuscare.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Validated
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        authService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Registration Successful");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/user/{loginId}")
    public ResponseEntity<UserLookupResponse> getUserByLoginId(
            @PathVariable @NotBlank(message = "loginId cannot be blank")
            String loginId) {

        return ResponseEntity.ok(authService.findByLoginId(loginId));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ChangePasswordResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {

        return ResponseEntity.ok(authService.changePassword(request));
    }
}