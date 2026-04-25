package com.gocomet.rfqauction.controller;


import com.gocomet.rfqauction.dto.RFQRequest;
import com.gocomet.rfqauction.entity.ActivityLog;
import com.gocomet.rfqauction.entity.Bid;
import com.gocomet.rfqauction.entity.RFQ;
import com.gocomet.rfqauction.repository.ActivityLogRepository;
import com.gocomet.rfqauction.service.BidService;
import com.gocomet.rfqauction.service.RFQService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController


@RequestMapping("/api/rfq")


@CrossOrigin(origins = "http://localhost:3000")
public class RFQController {

    @Autowired
    private RFQService rfqService;

    @Autowired
    private BidService bidService;

    @Autowired
    private ActivityLogRepository activityLogRepository;


    @PostMapping("/create")
    public ResponseEntity<RFQ> createRFQ(@RequestBody RFQRequest request) {
        RFQ rfq = rfqService.createRFQ(request);
        // ResponseEntity.ok() sends 200 OK with the rfq as JSON
        return ResponseEntity.ok(rfq);
    }

    @GetMapping("/all")
    public ResponseEntity<List<RFQ>> getAllRFQs() {
        return ResponseEntity.ok(rfqService.getAllRFQs());
    }


    @GetMapping("/{id}")
    public ResponseEntity<RFQ> getRFQ(@PathVariable Long id) {
        return ResponseEntity.ok(rfqService.getRFQById(id));
    }


    @GetMapping("/{id}/bids")
    public ResponseEntity<List<Bid>> getBids(@PathVariable Long id) {
        return ResponseEntity.ok(bidService.getBidsForRFQ(id));
    }

    @GetMapping("/{id}/logs")
    public ResponseEntity<List<ActivityLog>> getLogs(@PathVariable Long id) {
        var rfq = rfqService.getRFQById(id);
        return ResponseEntity.ok(activityLogRepository.findByRfqOrderByTimestampDesc(rfq));
    }
}