package com.dharohar;

import com.dharohar.model.User;
import com.dharohar.model.Asset;
import com.dharohar.repository.UserRepository;
import com.dharohar.repository.AssetRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;

@SpringBootApplication
@EnableAsync
public class DharoharBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(DharoharBackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedDatabase(UserRepository userRepository, AssetRepository assetRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            createIfMissing(userRepository, passwordEncoder, "anvesh@dharohar.com", "anvesh", "ROLE_COMMUNITY", "Warli Tribe", "Maharashtra");
            createIfMissing(userRepository, passwordEncoder, "aryan@dharohar.com", "aryan", "ROLE_REVIEW", "Warli Tribe", "Maharashtra");
            createIfMissing(userRepository, passwordEncoder, "akshay@dharohar.com", "akshay", "ROLE_ADMIN", "Central Admin", "Delhi");
            createIfMissing(userRepository, passwordEncoder, "aditya@dharohar.com", "aditya", "ROLE_GENERAL", "General Public", "Karnataka");

            // Self-heal/migrate any stuck "PROCESSING" assets to "PENDING"
            for (Asset asset : assetRepository.findAll()) {
                if ("PROCESSING".equalsIgnoreCase(asset.getApprovalStatus())) {
                    System.out.println("Self-healing asset: " + asset.getTitle() + " (stuck in PROCESSING)");
                    asset.setApprovalStatus("PENDING");
                    assetRepository.save(asset);
                }
            }
        };
    }

    private void createIfMissing(UserRepository repo, PasswordEncoder encoder, String email, String username, String role, String community, String state) {
        User u = repo.findByEmail(email).orElse(new User());
        u.setEmail(email);
        u.setUsername(username);
        u.setPassword(encoder.encode(username)); // Set password directly to the username (e.g. "anvesh")
        u.setCommunityName(community);
        u.setState(state);
        Set<String> roles = new HashSet<>();
        roles.add(role);
        u.setRoles(roles);
        repo.save(u);
        System.out.println("Upserted test user: " + email + " with password: " + username);
    }
}
