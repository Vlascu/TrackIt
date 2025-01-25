package com.example.demo.model.utils;

import com.example.demo.model.entities.Workout;
import org.springframework.web.bind.annotation.RequestBody;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

public class ObjectMapper {
    public static <T> Map<String, Object> objectToMap(T object) {
        Map<String, Object> map = new HashMap<>();
        if (object == null) {
            return map;
        }
        Class<?> clazz = object.getClass();
        Field[] fields = clazz.getDeclaredFields();

        for (Field field : fields) {
            field.setAccessible(true);
            try {
                map.put(field.getName(), field.get(object));
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            }
        }
        return map;
    }

    public static WorkoutInfo mapReqBodyToWorkoutInfo(@RequestBody Map<String, Object> body) {
        String exerciseName = (String) body.get("exerciseName");
        String muscleGroup = (String) body.get("muscleGroup");
        String date = (String) body.get("date");
        String sets = (String) body.get("sets");

        return new WorkoutInfo(exerciseName, muscleGroup, date, sets);
    }
}
