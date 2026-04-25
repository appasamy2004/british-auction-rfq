package com.gocomet.rfqauction.scheduler;

import com.gocomet.rfqauction.entity.RFQ;
import com.gocomet.rfqauction.repository.RFQRepository;
import com.gocomet.rfqauction.service.RFQService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.List;


@Component
public class AuctionScheduler {

    @Autowired
    private RFQRepository rfqRepository;

    @Autowired
    private RFQService rfqService;

    @Scheduled(fixedRate = 60000)
    public void closeExpiredAuctions() {

        LocalDateTime now = LocalDateTime.now();

        // Get all auctions that are still ACTIVE
        List<RFQ> activeAuctions = rfqRepository.findByStatus("ACTIVE");

        for (RFQ rfq : activeAuctions) {

            // Check 1: Has the forced close time passed?
            if (now.isAfter(rfq.getForcedCloseTime())) {
                // Force close — override everything
                rfq.setStatus("FORCE_CLOSED");
                rfqRepository.save(rfq);
                rfqService.logActivity(rfq, "AUCTION_CLOSED",
                        "Auction force-closed at " + now + " (Forced Close Time reached)");
            }

            // Check 2: Has the regular bid close time passed?
            else if (now.isAfter(rfq.getBidCloseTime())) {
                rfq.setStatus("CLOSED");
                rfqRepository.save(rfq);
                rfqService.logActivity(rfq, "AUCTION_CLOSED",
                        "Auction closed at " + now + " (Bid Close Time reached)");
            }
        }
    }
}
