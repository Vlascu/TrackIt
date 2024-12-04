package com.example.demo.model.repos;

import com.example.demo.model.entities.AppUser;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface UserRepository extends CrudRepository<AppUser, Long> {
    Optional<AppUser> findUserByFirstNameAndLastName(String firstName, String lastName);
    Optional<AppUser> findUserByFirstNameAndLastNameAndPassword(String firstName, String lastName, String password);
}
