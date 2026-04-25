package com.gocomet.rfqauction.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rfq")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RFQ {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String rfqName;

    @Column(unique = true, nullable = false)
    private String referenceId;

    @Column(nullable = false)
    private LocalDateTime bidStartTime;   // When bidding opens

    @Column(nullable = false)
    private LocalDateTime bidCloseTime;

    @Column(nullable = false)
    private LocalDateTime forcedCloseTime;
    private LocalDateTime pickupDate;
    private int triggerWindowMinutes;
    private int extensionDurationMinutes;
    private String extensionTrigger;
    @Column(nullable = false)
    private String status = "ACTIVE";
    private int extensionCount = 0;
}