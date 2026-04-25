package com.gocomet.rfqauction.controller;


import com.gocomet.rfqauction.dto.BidRequest;
import com.gocomet.rfqauction.entity.Bid;
import com.gocomet.rfqauction.service.BidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bid")
@CrossOrigin(origins = "http://localhost:3000")
public class BidController {

    @Autowired
    private BidService bidService;

    // POST /api/bid/submit — Submit a new bid
    @PostMapping("/submit")
    public ResponseEntity<Bid> submitBid(@RequestBody BidRequest request) {
        Bid bid = bidService.submitBid(request);
        return ResponseEntity.ok(bid);
    }
}
