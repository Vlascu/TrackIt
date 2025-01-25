package com.example.demo.model.service;

import com.example.demo.model.entities.Exercise;
import com.example.demo.model.repos.ExerciseRepository;
import com.example.demo.model.utils.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ExerciseService {
    private final ExerciseRepository exerciseRepository;

    @Autowired
    public ExerciseService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    public ResponseEntity<?> getAllExercisesByMuscleGroup(String muscleGroup) {
        Optional<List<Exercise>> result = exerciseRepository.findAllByMuscleGroup(muscleGroup);

        if (result.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Couldn't find exercises from the muscle group: " + muscleGroup));
        }

        Map<String, Object> exercises = new HashMap<>();

        List<Exercise> exercisesList = result.get();

        for (int index = 0; index < exercisesList.size(); index++) {
            exercises.put(String.valueOf(index), ObjectMapper.objectToMap(exercisesList.get(index)));
        }

        return ResponseEntity.ok(exercises);
    }
}
