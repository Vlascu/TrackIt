package com.example.demo.model.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class WeightUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private AppUser user;

    private int month;
    private int day;
    private int year;

    private float newWeightValue;

    public WeightUpdate() {}

    public WeightUpdate(AppUser appUser, int month, int day, int year, float newWeightValue)
    {
        this.user = appUser;
        this.month = month;
        this.day = day;
        this.year = year;
        this.newWeightValue = newWeightValue;
    }
}
