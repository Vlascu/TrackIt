package com.example.demo.model.service;

import com.example.demo.model.entities.Exercise;
import com.example.demo.model.repos.ExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ExerciseService {
    private final ExerciseRepository exerciseRepository;

    @Autowired
    public ExerciseService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    public Optional<List<Exercise>> getAllExercisesByMuscleGroup(String muscleGroup) {
        try {
            return exerciseRepository.findAllByMuscleGroup(muscleGroup);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
