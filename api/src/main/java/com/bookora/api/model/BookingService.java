package com.bookora.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "services")
public class BookingService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer duration;

    @Column(nullable = false)
    private boolean active = true;

    protected BookingService() {}

    public BookingService(String name, String description,
            String category, BigDecimal price, Integer duration) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.price = price;
        this.duration = duration;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public BigDecimal getPrice() { return price; }
    public Integer getDuration() { return duration; }
    public boolean isActive() { return active; }
}
