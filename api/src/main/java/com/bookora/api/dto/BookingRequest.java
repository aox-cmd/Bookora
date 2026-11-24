package com.bookora.api.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;

public record BookingRequest(
    @NotNull @Positive Long serviceId,
    @NotBlank @Size(max = 100) String customerName,
    @NotBlank @Email @Size(max = 254) String customerEmail,
    @NotNull @FutureOrPresent LocalDate date,
    @NotNull LocalTime time
) {}
