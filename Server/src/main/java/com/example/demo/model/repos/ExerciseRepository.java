package com.example.demo.model.repos;

import com.example.demo.model.entities.Exercise;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseRepository extends CrudRepository<Exercise, Long> {
    Optional<List<Exercise>> findAllByMuscleGroup(String muscleGroup);
}
