package com.example.demo.model.utils.ValidationHelpers;

public enum MuscleGroups {
    CHEST,
    BACK,
    BICEPS,
    TRICEPS,
    SHOULDER,
    ABS,
    LEGS,
    FOREARM;

    public static boolean isGroupPresent(String group) {
        for (MuscleGroups muscle : MuscleGroups.values()) {
            if (muscle.name().equalsIgnoreCase(group)) {
                return true;
            }
        }
        return false;
    }
}

