package com.example.demo.model.repos;

import com.example.demo.model.entities.AppUser;
import com.example.demo.model.entities.Workout;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutRepository extends CrudRepository<Workout, Long> {
    List<Workout> findAllByDayAndMonthAndYearAndAppUser(int day, int month, int year, AppUser appUser);
}
