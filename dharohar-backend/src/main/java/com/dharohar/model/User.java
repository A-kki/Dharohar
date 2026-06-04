package com.dharohar.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Set;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String username;
    private String email;
    private String password; // BCrypt hashed
    private Set<String> roles; // ROLE_COMMUNITY, ROLE_REVIEW, ROLE_ADMIN, ROLE_GENERAL
    private String communityName; // e.g. Warli Tribe
    private String state; // e.g. Maharashtra

    public User() {
    }

    public User(String id, String username, String email, String password, Set<String> roles, String communityName, String state) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.roles = roles;
        this.communityName = communityName;
        this.state = state;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public String getCommunityName() {
        return communityName;
    }

    public void setCommunityName(String communityName) {
        this.communityName = communityName;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }
}
