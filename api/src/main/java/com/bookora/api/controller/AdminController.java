package com.bookora.api.controller;

import com.bookora.api.model.Booking;
import com.bookora.api.service.BookingEngine;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final BookingEngine engine;

    public AdminController(BookingEngine engine) {
        this.engine = engine;
    }

    @GetMapping("/me")
    public Map<String, String> me() {
        return Map.of(
            "username", "admin",
            "role", "ADMIN"
        );
    }

    @GetMapping("/bookings")
    public List<Booking> bookings() {
        return engine.allBookings();
    }

    @GetMapping("/stats")
    public Map<String, Object> statistics() {
        return engine.statistics();
    }

    @PatchMapping("/bookings/{reference}/complete")
    public Booking complete(@PathVariable String reference) {
        return engine.complete(reference);
    }

    @PatchMapping("/bookings/{reference}/cancel")
    public Booking cancel(@PathVariable String reference) {
        return engine.cancel(reference);
    }
}
