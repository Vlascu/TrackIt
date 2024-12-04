package com.example.demo.model.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Workout {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private AppUser appUser;

    private String muscleGroup;
    private String exerciseName;

    private int month;
    private int day;
    private int year;

    public Workout() {

    }
    public Workout(AppUser appUser, String muscleGroup, String exerciseName, int day, int month, int year) {
        this.appUser = appUser;
        this.muscleGroup = muscleGroup;
        this.exerciseName = exerciseName;
        this.day = day;
        this.month = month;
        this.year = year;
    }
}
