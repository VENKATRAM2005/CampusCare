package com.campuscare.security;

import com.campuscare.entity.User;
import com.campuscare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String loginId)
            throws UsernameNotFoundException {

        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getLoginId())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .disabled(!Boolean.TRUE.equals(user.getEnabled()))
                .build();
    }
}
