package com.example.demo.model.service;

import com.example.demo.model.entities.AppUser;
import com.example.demo.model.repos.UserRepository;
import org.apache.commons.codec.binary.Hex;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;

    @Autowired
    UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<AppUser> save(AppUser appUser) {
        try {
            return Optional.of(userRepository.save(appUser));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Optional<AppUser> findUser(String firstName, String lastName) {
        return userRepository.findUserByFirstNameAndLastName(firstName, lastName);
    }

    public Optional<AppUser> getLoggedUser(String firstName, String lastName, String password) {
        return userRepository.findUserByFirstNameAndLastNameAndPassword(firstName, lastName, password);
    }

    public static String hashPassword(String password) {
        try {
            MessageDigest hasher = MessageDigest.getInstance("SHA-256");

            byte[] hashedPassword = hasher.digest(password.getBytes());

            return Hex.encodeHexString(hashedPassword);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    public Optional<AppUser> findUserById(long id) {
        return userRepository.findById(id);
    }
}
