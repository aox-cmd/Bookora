package com.bookora.api.config;

import com.bookora.api.model.BookingService;
import com.bookora.api.repository.ServiceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedServices(ServiceRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.saveAll(List.of(
                    new BookingService(
                        "Personal Consultation",
                        "A personalized session tailored to your goals.",
                        "Consulting", new BigDecimal("49.00"), 30
                    ),
                    new BookingService(
                        "Strategy Session",
                        "Build a clear roadmap with expert guidance.",
                        "Business", new BigDecimal("89.00"), 60
                    ),
                    new BookingService(
                        "Wellness Session",
                        "Take time to reset, recharge and refocus.",
                        "Wellness", new BigDecimal("59.00"), 45
                    ),
                    new BookingService(
                        "Career Coaching",
                        "Professional guidance for your next career move.",
                        "Coaching", new BigDecimal("79.00"), 60
                    ),
                    new BookingService(
                        "Creative Workshop",
                        "Explore ideas and unlock your creative potential.",
                        "Creative", new BigDecimal("69.00"), 60
                    ),
                    new BookingService(
                        "Quick Discovery Call",
                        "Discuss your needs and explore your options.",
                        "Consulting", new BigDecimal("19.00"), 15
                    )
                ));
            }
        };
    }
}
