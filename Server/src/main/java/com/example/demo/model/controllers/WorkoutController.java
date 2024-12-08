package com.example.demo.model.controllers;

import com.example.demo.model.entities.AppUser;
import com.example.demo.model.entities.Workout;
import com.example.demo.model.service.UserService;
import com.example.demo.model.service.WorkoutService;
import com.example.demo.model.utils.ObjectMapper;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
public class WorkoutController {
    private final UserService userService;
    private final WorkoutService workoutService;

    @Autowired
    WorkoutController(UserService userService, WorkoutService workoutService) {
        this.userService = userService;
        this.workoutService = workoutService;
    }

    @PostMapping("/workout/save")
    public ResponseEntity<?> saveWorkout(@RequestBody Map<String, Object> body, HttpSession session) {
        try
        {
            long userId =(Long) session.getAttribute("userId");

            String exerciseName = (String) body.get("exerciseName");
            String muscleGroup = (String) body.get("muscleGroup");
            String date = (String) body.get("date");
            String sets = (String) body.get("sets");

            //TODO: validation

            Optional<AppUser> foundUser = userService.findUserById(userId);

            if(foundUser.isPresent()) {
                Optional<Workout> savedWorkout = workoutService.saveWorkout(foundUser.get(), exerciseName, muscleGroup, date, sets);

                if(savedWorkout.isPresent()) {
                    return ResponseEntity.ok().body(ObjectMapper.objectToMap(savedWorkout.get()));
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Couldn't save workout"));
                }
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Couldn't find user with current session id"));
            }
        } catch (Exception e)
        {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Unexpected error: " + e.getMessage()));
        }

    }

    @GetMapping("/workout/alldate")
    public ResponseEntity<?> getWorkoutsByDate(@RequestParam("date") String date, HttpSession httpSession) {
        try {
            long userId = (Long) httpSession.getAttribute("userId");

            Optional<AppUser> foundUser = userService.findUserById(userId);

            if(foundUser.isPresent()) {
                Optional<List<Workout>> foundWorkouts = workoutService.getAllWorkoutsByDate(date, foundUser.get());

                if(foundWorkouts.isPresent()) {
                    Map<String, Object> workouts = new HashMap<>();

                    List<Workout> workoutsList = foundWorkouts.get();

                    for(int index = 0; index < workoutsList.size(); index++) {
                        workouts.put(String.valueOf(index), ObjectMapper.objectToMap(workoutsList.get(index)));
                    }

                    return ResponseEntity.ok().body(workouts);
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("info", "No workouts on this date"));
                }
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Couldn't find user with current session id"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Unexpected error occurred"));
        }

    }

}
