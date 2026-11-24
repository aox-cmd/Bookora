package com.bookora.api.controller;

import com.bookora.api.dto.BookingRequest;
import com.bookora.api.model.Booking;
import com.bookora.api.service.BookingEngine;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api")
public class BookingController {

    private final BookingEngine engine;

    public BookingController(BookingEngine engine) {
        this.engine = engine;
    }

    @GetMapping("/availability")
    public List<LocalTime> availability(
        @RequestParam Long serviceId,
        @RequestParam
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate date
    ) {
        return engine.availability(serviceId, date);
    }

    @PostMapping("/bookings")
    @ResponseStatus(HttpStatus.CREATED)
    public Booking create(
        @Valid @RequestBody BookingRequest request
    ) {
        return engine.create(request);
    }

    @GetMapping("/bookings/{reference}")
    public Booking find(@PathVariable String reference) {
        return engine.find(reference);
    }

    @DeleteMapping("/bookings/{reference}")
    public Booking cancel(@PathVariable String reference) {
        return engine.cancel(reference);
    }
}
