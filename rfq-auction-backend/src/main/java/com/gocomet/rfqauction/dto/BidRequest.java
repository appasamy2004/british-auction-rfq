package com.gocomet.rfqauction.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BidRequest {
    private Long rfqId;
    private String supplierName;
    private Double freightCharges;
    private Double originCharges;
    private Double destinationCharges;
    private Integer transitTime;
    private String quoteValidity;
}
