package com.dharohar.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@Service
public class StorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private Path rootPath;

    @PostConstruct
    public void init() {
        try {
            rootPath = Paths.get(uploadDir).toAbsolutePath();
            Files.createDirectories(rootPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage folder: " + uploadDir, e);
        }
    }

    public String storeFile(MultipartFile file, String subfolder) {
        try {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("Cannot store empty file.");
            }

            Path folderPath = rootPath.resolve(subfolder);
            Files.createDirectories(folderPath);

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String filename = UUID.randomUUID().toString() + extension;
            Path destinationFile = folderPath.resolve(filename);

            Files.copy(file.getInputStream(), destinationFile);
            return subfolder + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    public String calculateHash(MultipartFile file) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = file.getBytes();
            byte[] hash = digest.digest(bytes);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException | IOException e) {
            throw new RuntimeException("Could not calculate SHA-256 hash", e);
        }
    }

    public Path load(String filename) {
        return rootPath.resolve(filename);
    }
}
