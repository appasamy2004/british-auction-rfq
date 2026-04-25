package com.gocomet.rfqauction.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bids")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "rfq_id", nullable = false)
    private RFQ rfq;

    @Column(nullable = false)
    private String supplierName;

    @Column(nullable = false)
    private Double freightCharges;

    private Double originCharges;

    private Double destinationCharges;

    private Double totalAmount;

    private Integer transitTime;

    private String quoteValidity;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    @Column(name = "bid_rank")
    private Integer rank;
}