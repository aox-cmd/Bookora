package com.bookora.api.repository;

import com.bookora.api.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository
        extends JpaRepository<Booking, Long> {

    Optional<Booking> findByReference(String reference);

    List<Booking> findByDateAndStatusNot(
        LocalDate date, String status
    );

    List<Booking> findAllByOrderByCreatedAtDesc();

    long countByStatus(String status);
}
