package com.smartlogistics.order_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data // <--- C'est lui qui génère setZoneId()
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerName;
    private Double latitude;
    private Double longitude;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private BigDecimal price;

    private LocalDateTime createdAt;

    
    private Integer zoneId;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = OrderStatus.CREATED;
    }
}