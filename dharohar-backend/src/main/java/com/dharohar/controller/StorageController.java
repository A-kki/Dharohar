package com.dharohar.controller;

import com.dharohar.service.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/storage")
public class StorageController {

    @Autowired
    private StorageService storageService;

    @PostMapping(value = "/upload", consumes = {"multipart/form-data"})
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        // Save file locally under a general folder
        String fileUrl = storageService.storeFile(file, "general-uploads");
        
        Map<String, String> response = new HashMap<>();
        // Pre-prefix with /api/uploads/ for direct browser accessibility
        response.put("fileId", "/api/uploads/" + fileUrl);
        return ResponseEntity.ok(response);
    }
}
