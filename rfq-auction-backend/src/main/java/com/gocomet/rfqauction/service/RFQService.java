package com.gocomet.rfqauction.service;

import com.gocomet.rfqauction.dto.RFQRequest;
import com.gocomet.rfqauction.entity.ActivityLog;
import com.gocomet.rfqauction.entity.RFQ;
import com.gocomet.rfqauction.repository.ActivityLogRepository;
import com.gocomet.rfqauction.repository.RFQRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;


@Service
public class RFQService {


    @Autowired
    private RFQRepository rfqRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;


    public RFQ createRFQ(RFQRequest request) {

        if (!request.getForcedCloseTime().isAfter(request.getBidCloseTime())) {

            throw new RuntimeException("Forced Close Time must be after Bid Close Time");
        }


        RFQ rfq = new RFQ();
        rfq.setRfqName(request.getRfqName());
        rfq.setReferenceId(request.getReferenceId());
        rfq.setBidStartTime(request.getBidStartTime());
        rfq.setBidCloseTime(request.getBidCloseTime());
        rfq.setForcedCloseTime(request.getForcedCloseTime());
        rfq.setPickupDate(request.getPickupDate());
        rfq.setTriggerWindowMinutes(request.getTriggerWindowMinutes());
        rfq.setExtensionDurationMinutes(request.getExtensionDurationMinutes());
        rfq.setExtensionTrigger(request.getExtensionTrigger());
        rfq.setStatus("ACTIVE");

        RFQ saved = rfqRepository.save(rfq);

        logActivity(saved, "RFQ_CREATED", "RFQ '" + saved.getRfqName() + "' created successfully");

        return saved;
    }

    // GET all RFQs
    public List<RFQ> getAllRFQs() {
        // findAll() → SELECT * FROM rfq
        return rfqRepository.findAll();
    }

    // GET single RFQ by ID
    public RFQ getRFQById(Long id) {
        // findById returns Optional — orElseThrow means "throw error if not found"
        return rfqRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RFQ not found with id: " + id));
    }

    // Helper method to save an activity log entry
    public void logActivity(RFQ rfq, String eventType, String description) {
        ActivityLog log = new ActivityLog();
        log.setRfq(rfq);
        log.setEventType(eventType);
        log.setDescription(description);
        log.setTimestamp(LocalDateTime.now()); // Current time
        activityLogRepository.save(log);
    }
}
