package com.example.demo.model.controllers;

import com.example.demo.model.entities.Exercise;
import com.example.demo.model.entities.Workout;
import com.example.demo.model.service.ExerciseService;
import com.example.demo.model.service.UserService;
import com.example.demo.model.service.WorkoutService;
import com.example.demo.model.utils.ObjectMapper;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
public class WorkoutController {
    private final WorkoutService workoutService;
    private final ExerciseService exerciseService;

    @Autowired
    WorkoutController(WorkoutService workoutService, ExerciseService exerciseService) {
        this.workoutService = workoutService;
        this.exerciseService = exerciseService;
    }

    @PostMapping("/workout/save")
    public ResponseEntity<?> saveWorkout(@RequestBody Map<String, Object> body, HttpSession session) {
        try {
            return workoutService.saveWorkout(body, session);
        } catch (Exception e) {
            return new ResponseEntity<>("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR);        }

    }

    @PutMapping("/workout/update")
    public ResponseEntity<?> updateWorkout(@RequestBody Map<String, Object> body, HttpSession session) {
        try {
            return workoutService.updateWorkout(body, session);
        } catch (Exception e) {
            return new ResponseEntity<>("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR);        }
    }

    @GetMapping("/workout/alldate")
    public ResponseEntity<?> getWorkoutsByDate(@RequestParam("date") String date, HttpSession httpSession) {
        try {
            return workoutService.getAllWorkoutsByDate(date, httpSession);
        } catch (Exception e) {
            return new ResponseEntity<>("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR);        }
    }

    @DeleteMapping("/workout/deleteById")
    public ResponseEntity<?> deleteWorkoutById(@RequestParam("id") String id) {
        try {
            return workoutService.deleteWorkoutById(id);
        } catch (Exception e) {
            return new ResponseEntity<>("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR);        }
    }

    @GetMapping("/workout/exercises")
    public ResponseEntity<?> getExercisesByMuscleGroup(@RequestParam("muscleGroup") String muscleGroup) {
        try {
            return exerciseService.getAllExercisesByMuscleGroup(muscleGroup);
        } catch (Exception e) {
            return new ResponseEntity<>("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR);        }
    }
}
