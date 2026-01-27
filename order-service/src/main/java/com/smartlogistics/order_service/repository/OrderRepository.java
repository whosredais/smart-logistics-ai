package com.smartlogistics.order_service.repository;

import com.smartlogistics.order_service.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Spring Data JPA gère tout le SQL automatiquement
}