package com.example.demo.model.service;

import com.example.demo.model.entities.AppUser;
import com.example.demo.model.entities.WeightUpdate;
import com.example.demo.model.repos.UserRepository;
import com.example.demo.model.repos.WeightUpdateRepository;
import com.example.demo.model.utils.ObjectMapper;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import org.apache.commons.codec.binary.Hex;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final WeightUpdateRepository weightUpdateRepository;

    private final WeightUpdateService weightUpdateService;

    @Autowired
    UserService(UserRepository userRepository, WeightUpdateRepository weightUpdateRepository, WeightUpdateService weightUpdateService) {
        this.userRepository = userRepository;
        this.weightUpdateRepository = weightUpdateRepository;
        this.weightUpdateService = weightUpdateService;
    }

    public Optional<AppUser> save(AppUser appUser) {
        try {
            return Optional.of(userRepository.save(appUser));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    @Transactional
    public ResponseEntity<?> registerAndUpdateWeight(String firstName, String lastName, String password,
                                                     Float bodyWeight, Float height, Integer age, HttpSession session) {

        if (firstName == null || lastName == null || password == null || bodyWeight == null || height == null || age == null) {
            return new ResponseEntity<>("Missing required fields", HttpStatus.BAD_REQUEST);
        }

        if (findUser(firstName, lastName).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "User already exists"));
        }

        String hashedPassword = hashPassword(password);

        AppUser appUser = new AppUser(firstName, lastName, hashedPassword, bodyWeight, height, age);

        Optional<AppUser> saveResult = save(appUser);

        if (saveResult.isEmpty()) {
            return new ResponseEntity<>("Failed to save user", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        LocalDate currentDate = LocalDate.now();

        int currentDay = currentDate.getDayOfMonth();
        int currentMonth = currentDate.getMonthValue();
        int currentYear = currentDate.getYear();

        WeightUpdate firstWeight = new WeightUpdate(appUser, currentMonth, currentDay, currentYear, appUser.getBodyWeight());

        this.weightUpdateRepository.save(firstWeight);

        session.setAttribute("userId", saveResult.get().getId());

        return ResponseEntity.ok(Map.of());
    }

    public Optional<AppUser> findUser(String firstName, String lastName) {
        return userRepository.findUserByFirstNameAndLastName(firstName, lastName);
    }

    public ResponseEntity<?> getLoggedUser(String firstName, String lastName, String password, HttpSession session) {
        if (firstName == null || lastName == null || password == null) {
            return new ResponseEntity<>("Missing required fields", HttpStatus.BAD_REQUEST);
        }

        String hashedPassword = hashPassword(password);

        Optional<AppUser> result = userRepository.findUserByFirstNameAndLastNameAndPassword(firstName, lastName, hashedPassword);

        if (result.isEmpty()) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        session.setAttribute("userId", result.get().getId());

        return ResponseEntity.ok(Map.of());
    }

    public static String hashPassword(String password) {
        try {
            MessageDigest hasher = MessageDigest.getInstance("SHA-256");

            byte[] hashedPassword = hasher.digest(password.getBytes());

            return Hex.encodeHexString(hashedPassword);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error while hashing the password" + e.getMessage());
        }
    }

    public ResponseEntity<?> findUserById(HttpSession session) {
        Object userId = session.getAttribute("userId");

        if (userId == null) {
            return new ResponseEntity<>("Session id of current user not found", HttpStatus.NOT_FOUND);
        }

        Optional<AppUser> user = userRepository.findById((Long) userId);

        if (user.isPresent()) {
            return ResponseEntity.ok(ObjectMapper.objectToMap(user.get()));
        }

        return new ResponseEntity<>("Can't find current user", HttpStatus.NOT_FOUND);
    }

    @Transactional
    public ResponseEntity<?> saveNewWeight(Float newWeight, String date, HttpSession session) {
        Object userId = session.getAttribute("userId");

        int[] dates = Arrays.stream(date.split("-"))
                .mapToInt(Integer::parseInt)
                .toArray();

        if (newWeight == null || date.isEmpty()) {
            return new ResponseEntity<>("Missing required fields", HttpStatus.BAD_REQUEST);
        }

        if (userId == null) {
            return new ResponseEntity<>("Session id of current user not found", HttpStatus.NOT_FOUND);
        }

        Optional<AppUser> user = userRepository.findById((Long) userId);

        if (user.isEmpty()) {
            return new ResponseEntity<>("Can't find current user", HttpStatus.NOT_FOUND);
        }

        AppUser existingUser = user.get();
        existingUser.setBodyWeight(newWeight);

        WeightUpdate update = new WeightUpdate(existingUser, dates[1], dates[0], dates[2], newWeight);

        Optional<WeightUpdate> savedWeight = weightUpdateService.save(update);

        Optional<AppUser> savedUser = save(existingUser);

        if (savedUser.isEmpty()) {
            return new ResponseEntity<>("Something went wrong when updating the user with the new weight", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if (savedWeight.isEmpty()) {
            return new ResponseEntity<>("Failed to save weight update", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.ok(ObjectMapper.objectToMap(savedWeight.get()));

    }

}
