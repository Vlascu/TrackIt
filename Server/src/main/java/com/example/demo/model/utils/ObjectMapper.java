package com.example.demo.model.utils;

import com.example.demo.model.entities.Workout;

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
}
