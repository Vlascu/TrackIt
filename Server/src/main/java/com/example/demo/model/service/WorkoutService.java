package com.example.demo.model.service;

import com.example.demo.model.entities.AppUser;
import com.example.demo.model.entities.Workout;
import com.example.demo.model.repos.WorkoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class WorkoutService {
    private final WorkoutRepository workoutRepository;

    @Autowired
    public WorkoutService(WorkoutRepository workoutRepository) {
        this.workoutRepository = workoutRepository;
    }

    public Optional<Workout> saveWorkout(AppUser appUser, String exerciseName, String muscleGroup, String date, String sets) {
        int[] dates = Arrays.stream(date.split("-"))
                .mapToInt(Integer::parseInt)
                .toArray();

        Workout workout = new Workout(appUser, muscleGroup, exerciseName, dates[0], dates[1], dates[2], sets);

        try {
            return Optional.of(workoutRepository.save(workout));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Optional<List<Workout>> getAllWorkoutsByDate(String date, long userId) {
        int[] dates = Arrays.stream(date.split("-"))
                .mapToInt(Integer::parseInt)
                .toArray();

        try {
            return Optional.of(workoutRepository.findAllByDayAndMonthAndYearAndAppUserId(dates[0], dates[1], dates[2], userId));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Optional<Workout> findWorkoutById(Long workoutId) {
        try {
            return workoutRepository.findById(workoutId);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Optional<Workout> updateWorkout(Workout workoutToUpdate) {
        try {
            return Optional.of(workoutRepository.save(workoutToUpdate));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Optional<Workout> findWorkoutByIdAndUserId(Long workoutId, Long userId) {
        try {
            return workoutRepository.findByIdAndAppUserId(workoutId, userId);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public boolean deleteWorkoutById(Long workoutId) {
        workoutRepository.deleteById(workoutId);

        return findWorkoutById(workoutId).isEmpty();
    }
}
