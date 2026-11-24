package com.bookora.api.controller;

import com.bookora.api.model.BookingService;
import com.bookora.api.repository.ServiceRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceRepository repository;

    public ServiceController(ServiceRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<BookingService> getServices() {
        return repository.findByActiveTrue();
    }
}
