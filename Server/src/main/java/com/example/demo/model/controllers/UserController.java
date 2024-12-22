package com.example.demo.model.controllers;

import com.example.demo.model.entities.AppUser;
import com.example.demo.model.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;
import java.util.Optional;

@Controller
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/user/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> reqBody, HttpSession session) {
        try {
            String firstName = (String) reqBody.get("firstName");
            String lastName = (String) reqBody.get("lastName");
            String password = (String) reqBody.get("password");
            Float bodyWeight = reqBody.get("bodyWeight") != null ? Float.parseFloat((String) reqBody.get("bodyWeight")) : null;
            Float height = reqBody.get("height") != null ?  Float.parseFloat((String) reqBody.get("height")) : null;
            Integer age = reqBody.get("age") != null ? Integer.parseInt((String) reqBody.get("age")) : null;

            if (firstName == null || lastName == null || password == null || bodyWeight == null || height == null || age == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Missing required fields"));
            }

            String hashedPassword = UserService.hashPassword(password);

            AppUser appUser = new AppUser(firstName, lastName, hashedPassword, bodyWeight, height, age);

            if (userService.findUser(firstName, lastName).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "User already exists"));
            } else {
                Optional<AppUser> result = userService.save(appUser);

                if (result.isPresent()) {
                    session.setAttribute("userId", result.get().getId());
                    return ResponseEntity.ok().body(Map.of("response", "ok"));
                } else {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Failed to save user"));
                }
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An unexpected error occurred"));
        }
    }

    @PostMapping("/user/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> reqBody, HttpSession session) {
        try {
            String firstName = (String) reqBody.get("firstName");
            String lastName = (String) reqBody.get("lastName");
            String password = (String) reqBody.get("password");

            if (firstName == null || lastName == null || password == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Missing required fields"));
            }

            String hashedPassword = UserService.hashPassword(password);

            Optional<AppUser> result = userService.getLoggedUser(firstName, lastName, hashedPassword);

            if(result.isPresent()) {
                session.setAttribute("userId", result.get().getId());
                return ResponseEntity.ok().body(Map.of("response", "ok"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An unexpected error occurred"));
        }
    }

    @GetMapping("/user/sessionId")
    public ResponseEntity<?> getSessionUserId(HttpSession session) {
        Object userId = session.getAttribute("userId");

        if (userId != null) {
            return ResponseEntity.ok(Map.of("userId", userId));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "No user ID in session"));
        }
    }

    @DeleteMapping("/user/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok().body(Map.of("response", "ok"));
    }

}
