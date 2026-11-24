package com.bookora.api.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "bookings", uniqueConstraints = {
    @UniqueConstraint(
        name = "unique_booking_slot",
        columnNames = {"booking_date", "booking_time", "active_slot"}
    )
})
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String reference = UUID.randomUUID().toString();

    @ManyToOne(optional = false)
    @JoinColumn(name = "service_id")
    private BookingService service;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String customerEmail;

    @Column(name = "booking_date", nullable = false)
    private LocalDate date;

    @Column(name = "booking_time", nullable = false)
    private LocalTime time;

    @Column(nullable = false)
    private String status = "CONFIRMED";

    @Column(name = "active_slot")
    private Integer activeSlot = 1;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected Booking() {}

    public Booking(BookingService service, String customerName,
            String customerEmail, LocalDate date, LocalTime time) {
        this.service = service;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.date = date;
        this.time = time;
    }

    public void cancel() {
        status = "CANCELLED";
        activeSlot = null;
    }

    public void complete() {
        status = "COMPLETED";
    }

    public Long getId() { return id; }
    public String getReference() { return reference; }
    public BookingService getService() { return service; }
    public String getCustomerName() { return customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public LocalDate getDate() { return date; }
    public LocalTime getTime() { return time; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
