package com.example.demo.model.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Arrays;

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

    private String sets;

    public Workout() {

    }
    public Workout(AppUser appUser, String muscleGroup, String exerciseName, int day, int month, int year, String sets) {
        this.appUser = appUser;
        this.muscleGroup = muscleGroup;
        this.exerciseName = exerciseName;
        this.day = day;
        this.month = month;
        this.year = year;
        this.sets = sets;
    }

    public void setDate(String date) {
        int[] dates = Arrays.stream(date.split("-"))
                .mapToInt(Integer::parseInt)
                .toArray();

        this.day = dates[0];
        this.month = dates[1];
        this.year = dates[2];
    }
}
