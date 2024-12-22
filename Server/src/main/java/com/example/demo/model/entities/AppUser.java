package com.example.demo.model.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Data
@Entity
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    private String firstName;
    private String lastName;
    private String password;

    private float bodyWeight;
    private float height;
    private float bmi;
    private int age;

    public AppUser() {

    }

    public AppUser(String firstName, String lastName, String password
            , float bodyWeight, float height, int age) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
        this.age = age;
        this.bodyWeight = bodyWeight;
        this.height = height;

        double metricHeight = height / 100;

        this.bmi = (float) (bodyWeight / Math.pow(metricHeight, 2.0));
    }
}
