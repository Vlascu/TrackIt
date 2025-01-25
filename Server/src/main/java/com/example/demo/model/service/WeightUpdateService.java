package com.example.demo.model.service;

import com.example.demo.model.entities.WeightUpdate;
import com.example.demo.model.repos.WeightUpdateRepository;
import com.example.demo.model.utils.ObjectMapper;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class WeightUpdateService {
    private final WeightUpdateRepository weightUpdateRepository;

    @Autowired
    public WeightUpdateService(WeightUpdateRepository weightUpdateRepository) {
        this.weightUpdateRepository = weightUpdateRepository;
    }

    public Optional<WeightUpdate> save(WeightUpdate weightUpdate) {
        try {
            return Optional.of(this.weightUpdateRepository.save(weightUpdate));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Optional<WeightUpdate> getWeightUpdateByDate(String date, long userId) {
        int[] dates = Arrays.stream(date.split("-"))
                .mapToInt(Integer::parseInt)
                .toArray();

        try {
            return this.weightUpdateRepository.getWeightUpdateByMonthAndDayAndYearAndUserId(dates[1], dates[0], dates[2], userId);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public ResponseEntity<?> getAllUpdatesByUser(HttpSession session) {
        Object userId = session.getAttribute("userId");

        if (userId == null) {
            return new ResponseEntity<>("Session id of current user not found", HttpStatus.NOT_FOUND);

        }

        List<WeightUpdate> results = this.weightUpdateRepository.getAllByUserId((Long) userId);

        if(results.isEmpty()) {
            return new ResponseEntity<>("No updates found for current user", HttpStatus.NOT_FOUND);
        }

        Map<String, Object> updatesMap = new HashMap<>();

        for (int index = 0; index < results.size(); index++) {
            updatesMap.put(String.valueOf(index), ObjectMapper.objectToMap(results.get(index)));
        }

        return ResponseEntity.ok(updatesMap);

    }
}
