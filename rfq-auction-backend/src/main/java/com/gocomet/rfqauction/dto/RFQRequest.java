package com.gocomet.rfqauction.dto;

import lombok.*;
import java.time.LocalDateTime;

// DTO = Data Transfer Object
// This is NOT stored in DB — it's just the shape of data coming from frontend
// We use this instead of the Entity directly to keep things clean and safe
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RFQRequest {
    private String rfqName;
    private String referenceId;
    private LocalDateTime bidStartTime;
    private LocalDateTime bidCloseTime;
    private LocalDateTime forcedCloseTime;
    private LocalDateTime pickupDate;
    private int triggerWindowMinutes;
    private int extensionDurationMinutes;
    private String extensionTrigger;
}
