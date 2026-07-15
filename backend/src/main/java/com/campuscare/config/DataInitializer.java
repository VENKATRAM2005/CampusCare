package com.campuscare.config;

import com.campuscare.entity.Role;
import com.campuscare.entity.User;
import com.campuscare.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private static final String TEMP_PASSWORD = "Temp@123";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Users table is not empty — skipping seed data");
            return;
        }

        String encodedPassword = passwordEncoder.encode(TEMP_PASSWORD);

        List<User> users = List.of(
                buildUser("721423104056", "Venkatram R", "721423104056@campuscare.edu",
                        Role.STUDENT, "CSE", 4, encodedPassword),
                buildUser("721423104044", "Pukazhya P", "721423104044@campuscare.edu",
                        Role.STUDENT, "CSE", 4, encodedPassword),
                buildUser("721423104006", "Agastin A", "721423104006@campuscare.edu",
                        Role.STUDENT, "CSE", 4, encodedPassword),
                buildUser("721423104015", "Aswini A", "721423104015@campuscare.edu",
                        Role.STUDENT, "CSE", 4, encodedPassword),
                buildUser("FAC001", "Ms. D Sujeetha", "fac001@campuscare.edu",
                        Role.MENTOR, "CSE", null, encodedPassword),
                buildUser("FAC002", "Ms. S Priya", "fac002@campuscare.edu",
                        Role.MENTOR, "CSE", null, encodedPassword),
                buildUser("HOD001", "Dr. S Sivakumar", "hod001@campuscare.edu",
                        Role.HOD, "CSE", null, encodedPassword),
                buildUser("ADM001", "Dr. P Maniiarasan", "adm001@campuscare.edu",
                        Role.ADMIN, "ADMINISTRATION", null, encodedPassword)
        );

        userRepository.saveAll(users);
        log.info("Seeded {} users into empty users table", users.size());
    }

    private User buildUser(
            String loginId,
            String name,
            String email,
            Role role,
            String department,
            Integer year,
            String encodedPassword) {

        return User.builder()
                .loginId(loginId)
                .name(name)
                .email(email)
                .password(encodedPassword)
                .role(role)
                .department(department)
                .year(year)
                .enabled(true)
                .firstLogin(true)
                .build();
    }
}
