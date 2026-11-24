package com.bookora.api.repository;

import com.bookora.api.model.BookingService;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceRepository
        extends JpaRepository<BookingService, Long> {

    List<BookingService> findByActiveTrue();
}
