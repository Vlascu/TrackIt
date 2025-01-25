package com.example.demo.model.controllers;

import com.example.demo.model.service.UserService;
import com.example.demo.model.service.WeightUpdateService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.*;

@Controller
public class UserController {
    private final UserService userService;
    private final WeightUpdateService weightUpdateService;

    @Autowired
    public UserController(UserService userService, WeightUpdateService weightUpdateService) {
        this.userService = userService;
        this.weightUpdateService = weightUpdateService;
    }

    @PostMapping("/user/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> reqBody, HttpSession session) {
        try {
            String firstName = (String) reqBody.get("firstName");
            String lastName = (String) reqBody.get("lastName");
            String password = (String) reqBody.get("password");
            Float bodyWeight = reqBody.get("bodyWeight") != null ? Float.parseFloat((String) reqBody.get("bodyWeight")) : null;
            Float height = reqBody.get("height") != null ? Float.parseFloat((String) reqBody.get("height")) : null;
            Integer age = reqBody.get("age") != null ? Integer.parseInt((String) reqBody.get("age")) : null;

            return userService.registerAndUpdateWeight(firstName, lastName, password, bodyWeight, height, age, session);
        } catch (Exception e) {
            return new ResponseEntity<>("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/user/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> reqBody, HttpSession session) {
        try {
            String firstName = (String) reqBody.get("firstName");
            String lastName = (String) reqBody.get("lastName");
            String password = (String) reqBody.get("password");

            return userService.getLoggedUser(firstName, lastName, password, session);

        } catch (Exception e) {
            return new ResponseEntity<>("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/user/sessionId")
    public ResponseEntity<?> getSessionUserId(HttpSession session) {
        Object userId = session.getAttribute("userId");

        if (userId == null) {
            return new ResponseEntity<>("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return ResponseEntity.ok(Map.of("userId", userId));
    }

    @DeleteMapping("/user/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Session invalidated successfully");
    }

    @GetMapping("/user/current-user")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        try {
            return userService.findUserById(session);
        } catch (Exception e) {
            return new ResponseEntity<>("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/user/get_updates")
    public ResponseEntity<?> getWeightUpdates(HttpSession session) {
        try {
            return weightUpdateService.getAllUpdatesByUser(session);
        } catch (Exception e) {
            return new ResponseEntity<>("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/user/new_weight")
    public ResponseEntity<?> saveNewWeight(@RequestBody Map<String, Object> reqBody, HttpSession session) {
        try {
            Float newWeight = reqBody.get("weight") != null ? Float.parseFloat((String) reqBody.get("weight")) : null;
            String date = (String) reqBody.get("date");

            return userService.saveNewWeight(newWeight, date, session);
        } catch (Exception e) {
            return new ResponseEntity<>("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
}
