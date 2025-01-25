package com.example.demo.model.service;

import com.example.demo.model.entities.AppUser;
import com.example.demo.model.entities.Workout;
import com.example.demo.model.repos.UserRepository;
import com.example.demo.model.repos.WorkoutRepository;
import com.example.demo.model.utils.ObjectMapper;
import com.example.demo.model.utils.ValidationHelpers.MuscleGroups;
import com.example.demo.model.utils.WorkoutInfo;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class WorkoutService {
    private final WorkoutRepository workoutRepository;
    private final UserRepository userRepository;

    @Autowired
    public WorkoutService(WorkoutRepository workoutRepository, UserRepository userRepository) {
        this.workoutRepository = workoutRepository;
        this.userRepository = userRepository;
    }

    public ResponseEntity<?> saveWorkout(Map<String, Object> body, HttpSession session) {
        String exerciseName = (String) body.get("exerciseName");
        String muscleGroup = (String) body.get("muscleGroup");
        String date = (String) body.get("date");
        String sets = (String) body.get("sets");

        if (!MuscleGroups.isGroupPresent(muscleGroup)) {
            return new ResponseEntity<>("Invalid muscle group", HttpStatus.BAD_REQUEST);
        }

        int[] dates = Arrays.stream(date.split("-"))
                .mapToInt(Integer::parseInt)
                .toArray();

        long userId = (Long) session.getAttribute("userId");

        Optional<AppUser> foundUser = userRepository.findById(userId);

        if (foundUser.isEmpty()) {
            return new ResponseEntity<>("Couldn't find user with current session id", HttpStatus.NOT_FOUND);
        }

        Workout workout = new Workout(foundUser.get(), muscleGroup, exerciseName, dates[0], dates[1], dates[2], sets);

        return ResponseEntity.ok(ObjectMapper.objectToMap(workoutRepository.save(workout)));
    }

    public ResponseEntity<?> getAllWorkoutsByDate(String date, HttpSession httpSession) {
        int[] dates = Arrays.stream(date.split("-"))
                .mapToInt(Integer::parseInt)
                .toArray();

        long userId = (Long) httpSession.getAttribute("userId");

        if (userRepository.findById(userId).isEmpty()) {
            return new ResponseEntity<>("Couldn't find user with current session id", HttpStatus.NOT_FOUND);
        }

        Optional<List<Workout>> foundWorkouts = workoutRepository.findAllByDayAndMonthAndYearAndAppUserId(dates[0], dates[1], dates[2], userId);

        if (foundWorkouts.isEmpty()) {
            return new ResponseEntity<>("No workouts on this date", HttpStatus.NOT_FOUND);
        }

        Map<String, Object> workouts = new HashMap<>();

        List<Workout> workoutsList = foundWorkouts.get();

        for (int index = 0; index < workoutsList.size(); index++) {
            workouts.put(String.valueOf(index), ObjectMapper.objectToMap(workoutsList.get(index)));
        }

        return ResponseEntity.ok(workouts);
    }

    public Optional<Workout> findWorkoutById(Long workoutId) {
        try {
            return workoutRepository.findById(workoutId);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public ResponseEntity<?> updateWorkout(Map<String, Object> body, HttpSession session) {
        Long workoutId = body.get("id") != null ? Long.parseLong((String) body.get("id")) : null;

        WorkoutInfo workoutInfo = ObjectMapper.mapReqBodyToWorkoutInfo(body);

        long userId = (Long) session.getAttribute("userId");
        // TODO: validation

        if (workoutId == null) {
            return new ResponseEntity<>("Null workout id from client", HttpStatus.BAD_REQUEST);
        }

        if (userRepository.findById(userId).isEmpty()) {
            return new ResponseEntity<>("Couldn't find user with current session id", HttpStatus.NOT_FOUND);
        }

        Optional<Workout> existingWorkout = workoutRepository.findById(workoutId);

        if (existingWorkout.isEmpty() || existingWorkout.get().getAppUser().getId() != (Long) session.getAttribute("userId")) {
            return new ResponseEntity<>("Workout not found or doesn't belong to the current user", HttpStatus.NOT_FOUND);
        }

        Workout workoutToUpdate = existingWorkout.get();
        workoutToUpdate.setExerciseName(workoutInfo.exerciseName());
        workoutToUpdate.setMuscleGroup(workoutInfo.muscleGroup());
        workoutToUpdate.setDate(workoutInfo.date());
        workoutToUpdate.setSets(workoutInfo.sets());

        Optional<Workout> updatedWorkout = save(workoutToUpdate);

        if (updatedWorkout.isEmpty()) {
            return new ResponseEntity<>("Couldn't update workout", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return ResponseEntity.ok(ObjectMapper.objectToMap(updatedWorkout.get()));
    }

    public Optional<Workout> findWorkoutByIdAndUserId(Long workoutId, Long userId) {
        try {
            return workoutRepository.findByIdAndAppUserId(workoutId, userId);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public ResponseEntity<?> deleteWorkoutById(String id) {
        Long workoutId = id != null ? Long.parseLong(id) : null;

        if (workoutId == null) {
            return new ResponseEntity<>("Bad workout id from client", HttpStatus.BAD_REQUEST);
        }
        workoutRepository.deleteById(workoutId);

        return ResponseEntity.ok(Map.of());
    }

    public Optional<Workout> save(Workout workout) {
        try {
            return Optional.of(workoutRepository.save(workout));
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
