package com.bookora.api.service;

import com.bookora.api.dto.BookingRequest;
import com.bookora.api.model.Booking;
import com.bookora.api.model.BookingService;
import com.bookora.api.repository.BookingRepository;
import com.bookora.api.repository.ServiceRepository;
import jakarta.persistence.EntityManager;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.*;
import java.util.*;

@Service
public class BookingEngine {

    private final BookingRepository bookings;
    private final ServiceRepository services;
    private final EntityManager entityManager;

    private static final ZoneId ZONE =
        ZoneId.of("Africa/Casablanca");

    private static final LocalTime OPEN =
        LocalTime.of(9, 0);

    private static final LocalTime CLOSE =
        LocalTime.of(18, 0);

    public BookingEngine(
        BookingRepository bookings,
        ServiceRepository services,
        EntityManager entityManager
    ) {
        this.bookings = bookings;
        this.services = services;
        this.entityManager = entityManager;
    }

    private BookingService getService(Long id) {
        return services.findById(id)
            .filter(BookingService::isActive)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Service not found"
            ));
    }

    private void validateDate(LocalDate date) {
        LocalDate today = LocalDate.now(ZONE);

        if (date.isBefore(today)
                || date.isAfter(today.plusDays(60))) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Choose a date within the next 60 days"
            );
        }
    }

    private boolean overlaps(
        LocalTime start,
        int duration,
        List<Booking> existing
    ) {
        LocalTime end = start.plusMinutes(duration);

        return existing.stream().anyMatch(booking -> {
            LocalTime existingStart = booking.getTime();

            LocalTime existingEnd = existingStart.plusMinutes(
                booking.getService().getDuration()
            );

            return start.isBefore(existingEnd)
                && end.isAfter(existingStart);
        });
    }

    @Transactional(readOnly = true)
    public List<LocalTime> availability(
        Long serviceId, LocalDate date
    ) {
        validateDate(date);

        BookingService service = getService(serviceId);

        List<Booking> existing =
            bookings.findByDateAndStatusNot(
                date, "CANCELLED"
            );

        List<LocalTime> slots = new ArrayList<>();

        LocalDateTime now = LocalDateTime.now(ZONE);

        for (
            LocalTime slot = OPEN;
            !slot.plusMinutes(service.getDuration())
                .isAfter(CLOSE);
            slot = slot.plusMinutes(15)
        ) {
            if (LocalDateTime.of(date, slot).isAfter(now)
                    && !overlaps(
                        slot, service.getDuration(), existing
                    )) {
                slots.add(slot);
            }
        }

        return slots;
    }

    @Transactional
    public Booking create(BookingRequest request) {

        validateDate(request.date());

        // PostgreSQL transaction lock.
        // Serializes booking creation for the same date.
        entityManager.createNativeQuery(
            "SELECT 1 FROM pg_advisory_xact_lock(:namespace, :day)"
        )
        .setParameter("namespace", 48201)
        .setParameter(
            "day", Math.toIntExact(request.date().toEpochDay())
        )
        .getSingleResult();

        BookingService service =
            getService(request.serviceId());

        LocalTime time = request.time();

        if (time.isBefore(OPEN)
                || !time.isBefore(CLOSE)
                || time.getMinute() % 15 != 0
                || time.getSecond() != 0
                || time.getNano() != 0
                || time.plusMinutes(service.getDuration())
                    .isAfter(CLOSE)
                || !LocalDateTime.of(request.date(), time)
                    .isAfter(LocalDateTime.now(ZONE))) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid appointment time"
            );
        }

        List<Booking> existing =
            bookings.findByDateAndStatusNot(
                request.date(), "CANCELLED"
            );

        if (overlaps(
                time, service.getDuration(), existing)) {

            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "This time slot is no longer available"
            );
        }

        Booking booking = new Booking(
            service,
            request.customerName().trim(),
            request.customerEmail().trim(),
            request.date(),
            time
        );

        return bookings.saveAndFlush(booking);
    }

    @Transactional(readOnly = true)
    public Booking find(String reference) {
        return bookings.findByReference(reference)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Booking not found"
            ));
    }

    @Transactional
    public Booking cancel(String reference) {
        Booking booking = find(reference);

        if (!booking.getStatus().equals("CONFIRMED")) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Only confirmed bookings can be cancelled"
            );
        }

        booking.cancel();

        return bookings.save(booking);
    }

    @Transactional
    public Booking complete(String reference) {
        Booking booking = find(reference);

        if (!booking.getStatus().equals("CONFIRMED")) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Only confirmed bookings can be completed"
            );
        }

        LocalDateTime end = LocalDateTime.of(
            booking.getDate(), booking.getTime()
        ).plusMinutes(booking.getService().getDuration());

        if (end.isAfter(LocalDateTime.now(ZONE))) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Appointment has not ended yet"
            );
        }

        booking.complete();

        return bookings.save(booking);
    }

    @Transactional(readOnly = true)
    public List<Booking> allBookings() {
        return bookings.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> statistics() {
        return Map.of(
            "total", bookings.count(),
            "confirmed", bookings.countByStatus("CONFIRMED"),
            "cancelled", bookings.countByStatus("CANCELLED"),
            "completed", bookings.countByStatus("COMPLETED"),
            "services", services.count()
        );
    }
}
