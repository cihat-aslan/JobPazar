package com.jobpazar.backend.config;

import com.jobpazar.backend.entity.User;
import com.jobpazar.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;

    public DataSeeder(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword("admin"); // In production, use BCrypt!
            admin.setEmail("admin@jobpazar.com");
            admin.setRole("ADMIN");
            admin.setRequestedRole(null); // Explicitly ensure no requested role
            userRepository.save(admin);
            System.out.println("Default ADMIN user created: admin / admin");
        } else {
            // Fix existing admin if needed
            User existingAdmin = userRepository.findByUsername("admin").get();
            if (existingAdmin.getRequestedRole() != null) {
                existingAdmin.setRequestedRole(null);
                userRepository.save(existingAdmin);
                System.out.println("Fixed existing ADMIN user requested role.");
            }
        }

        if (userRepository.findByUsername("admin2").isEmpty()) {
            User admin2 = new User();
            admin2.setUsername("admin2");
            admin2.setPassword("admin");
            admin2.setEmail("admin2@jobpazar.com");
            admin2.setRole("ADMIN");
            admin2.setRequestedRole(null);
            userRepository.save(admin2);
            System.out.println("Second ADMIN user created: admin2 / admin");
        }
    }
}
