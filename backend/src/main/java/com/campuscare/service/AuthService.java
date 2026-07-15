package com.campuscare.service;

import com.campuscare.dto.ChangePasswordRequest;
import com.campuscare.dto.ChangePasswordResponse;
import com.campuscare.dto.LoginRequest;
import com.campuscare.dto.LoginResponse;
import com.campuscare.dto.RegisterRequest;
import com.campuscare.dto.UserLookupResponse;
import com.campuscare.entity.User;
import com.campuscare.exception.BadRequestException;
import com.campuscare.exception.UnauthorizedException;
import com.campuscare.repository.UserRepository;
import com.campuscare.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public void register(RegisterRequest request) {

        User user = User.builder()
                .loginId(request.getLoginId())
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .department(request.getDepartment())
                .year(request.getYear())
                .firstLogin(true)
                .enabled(true)
                .build();

        userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getLoginId(),
                        request.getPassword())
        );

        User user = userRepository.findByLoginId(request.getLoginId())
                .orElseThrow();

        String token = jwtService.generateToken(
                org.springframework.security.core.userdetails.User
                        .withUsername(user.getLoginId())
                        .password(user.getPassword())
                        .roles(user.getRole().name())
                        .build());

        return LoginResponse.builder()
                .token(token)
                .name(user.getName())
                .role(user.getRole())
                .department(user.getDepartment())
                .year(user.getYear())
                .firstLogin(user.getFirstLogin())
                .build();
    }

    public ChangePasswordResponse changePassword(ChangePasswordRequest request) {
        String loginId = resolveAuthenticatedLoginId();

        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Old password is incorrect");
        }

        if (request.getOldPassword().equals(request.getNewPassword())) {
            throw new BadRequestException("New password must be different from old password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setFirstLogin(false);
        userRepository.save(user);

        return ChangePasswordResponse.builder()
                .message("Password changed successfully")
                .firstLogin(false)
                .build();
    }

    private String resolveAuthenticatedLoginId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new UnauthorizedException("Authentication required");
        }

        return authentication.getName();
    }

    public UserLookupResponse findByLoginId(String loginId) {
        if (loginId == null || loginId.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "loginId cannot be blank");
        }

        return userRepository.findByLoginId(loginId.trim())
                .map(this::toUserLookupResponse)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));
    }

    private UserLookupResponse toUserLookupResponse(User user) {
        return UserLookupResponse.builder()
                .name(user.getName())
                .department(user.getDepartment())
                .year(user.getYear())
                .role(user.getRole())
                .build();
    }
}
