package com.dharohar.controller;

import com.dharohar.config.JwtTokenProvider;
import com.dharohar.model.User;
import com.dharohar.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody Map<String, Object> req) {
        String email = (String) req.get("email");
        String password = (String) req.get("password");
        String username = (String) req.get("username");
        String communityName = (String) req.get("communityName");
        String state = (String) req.get("state");
        
        // Default role is GENERAL if not specified
        String roleInput = (String) req.get("role"); // general, community, review, admin
        if (roleInput == null) {
            roleInput = "general";
        }
        
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setUsername(username != null ? username : email.split("@")[0]);
        user.setPassword(passwordEncoder.encode(password));
        user.setCommunityName(communityName);
        user.setState(state);

        Set<String> roles = new HashSet<>();
        roles.add("ROLE_" + roleInput.toUpperCase());
        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        Map<String, Object> res = new HashMap<>();
        res.put("id", savedUser.getId());
        res.put("email", savedUser.getEmail());
        res.put("message", "User registered successfully");
        return new ResponseEntity<>(res, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody Map<String, Object> loginRequest) {
        String email = (String) loginRequest.get("email");
        String password = (String) loginRequest.get("password");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        List<String> roleNames = new ArrayList<>(user.getRoles());
        String token = jwtTokenProvider.generateToken(user.getUsername(), roleNames);

        // Map roles back to standard format for frontend ('community', 'review', etc.)
        List<String> cleanRoles = new ArrayList<>();
        for (String r : roleNames) {
            cleanRoles.add(r.replace("ROLE_", "").toLowerCase());
        }

        Map<String, Object> res = new HashMap<>();
        res.put("token", token);
        
        Map<String, Object> userJson = new HashMap<>();
        userJson.put("id", user.getId());
        userJson.put("email", user.getEmail());
        userJson.put("roles", cleanRoles);
        userJson.put("role", cleanRoles.isEmpty() ? "" : cleanRoles.get(0));
        userJson.put("communityName", user.getCommunityName());
        userJson.put("state", user.getState());
        
        res.put("user", userJson);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getProfile() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("User profile not found"));

        List<String> cleanRoles = new ArrayList<>();
        for (String r : user.getRoles()) {
            cleanRoles.add(r.replace("ROLE_", "").toLowerCase());
        }

        Map<String, Object> userJson = new HashMap<>();
        userJson.put("id", user.getId());
        userJson.put("email", user.getEmail());
        userJson.put("username", user.getUsername());
        userJson.put("roles", cleanRoles);
        userJson.put("communityName", user.getCommunityName());
        userJson.put("state", user.getState());

        return ResponseEntity.ok(userJson);
    }
}
