package com.gocomet.rfqauction.service;


import com.gocomet.rfqauction.dto.BidRequest;
import com.gocomet.rfqauction.entity.Bid;
import com.gocomet.rfqauction.entity.RFQ;
import com.gocomet.rfqauction.repository.BidRepository;
import com.gocomet.rfqauction.repository.RFQRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BidService {

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private RFQRepository rfqRepository;

    @Autowired
    private RFQService rfqService;

    // SUBMIT a new bid — this is the most complex method
    @Transactional  // Ensures all DB operations succeed together or all fail together
    public Bid submitBid(BidRequest request) {

        // Step 1: Find the RFQ this bid belongs to
        RFQ rfq = rfqRepository.findById(request.getRfqId())
                .orElseThrow(() -> new RuntimeException("RFQ not found"));

        // Step 2: Check if auction is still active
        if (!rfq.getStatus().equals("ACTIVE")) {
            throw new RuntimeException("This auction is closed. No more bids allowed.");
        }

        // Step 3: Check if current time is before bid close time
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(rfq.getBidCloseTime())) {
            throw new RuntimeException("Bidding time has ended for this auction.");
        }

        // Step 4: Create the bid object
        Bid bid = new Bid();
        bid.setRfq(rfq);
        bid.setSupplierName(request.getSupplierName());
        bid.setFreightCharges(request.getFreightCharges());
        bid.setOriginCharges(request.getOriginCharges() != null ? request.getOriginCharges() : 0.0);
        bid.setDestinationCharges(request.getDestinationCharges() != null ? request.getDestinationCharges() : 0.0);

        // Step 5: Calculate total amount = freight + origin + destination
        double total = bid.getFreightCharges() + bid.getOriginCharges() + bid.getDestinationCharges();
        bid.setTotalAmount(total);

        bid.setTransitTime(request.getTransitTime());
        bid.setQuoteValidity(request.getQuoteValidity());
        bid.setSubmittedAt(now);

        // Step 6: Save bid to database
        Bid savedBid = bidRepository.save(bid);

        // Step 7: Re-calculate rankings for ALL bids in this RFQ
        recalculateRanks(rfq);

        // Step 8: Log the bid submission
        rfqService.logActivity(rfq, "BID_SUBMITTED",
                request.getSupplierName() + " submitted bid of ₹" + total);

        // Step 9: Check if auction should be extended
        checkAndExtendAuction(rfq, savedBid);

        return savedBid;
    }

    // RECALCULATE RANKS — called after every new bid
    private void recalculateRanks(RFQ rfq) {
        // Get all bids sorted by total amount (lowest = best = L1)
        List<Bid> sortedBids = bidRepository.findByRfqOrderByTotalAmountAsc(rfq);

        // Loop through and assign ranks: index 0 = rank 1 (L1), index 1 = rank 2 (L2)...
        for (int i = 0; i < sortedBids.size(); i++) {
            sortedBids.get(i).setRank(i + 1); // +1 because rank starts at 1, not 0
            bidRepository.save(sortedBids.get(i)); // Save updated rank
        }
    }

    // CHECK AND EXTEND AUCTION — the heart of British Auction logic
    private void checkAndExtendAuction(RFQ rfq, Bid newBid) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime closeTime = rfq.getBidCloseTime();

        // Calculate when the trigger window starts
        // Example: closeTime = 6:00 PM, triggerWindow = 10 min
        // → windowStart = 5:50 PM
        LocalDateTime windowStart = closeTime.minusMinutes(rfq.getTriggerWindowMinutes());

        // Check if we are currently INSIDE the trigger window
        // i.e., now is between 5:50 PM and 6:00 PM
        boolean inTriggerWindow = now.isAfter(windowStart) && now.isBefore(closeTime);

        if (!inTriggerWindow) {
            // Bid came in before the trigger window — no extension needed
            return;
        }

        // We ARE in the trigger window — now check which trigger type is configured
        boolean shouldExtend = false;
        String reason = "";

        String triggerType = rfq.getExtensionTrigger();

        if (triggerType.equals("BID_RECEIVED")) {
            // Rule: ANY bid in the window triggers extension
            // Since we just received a bid and we're in window — always extend
            shouldExtend = true;
            reason = "New bid received from " + newBid.getSupplierName() + " during trigger window";

        } else if (triggerType.equals("ANY_RANK_CHANGE")) {
            // Rule: Extension only if rankings changed
            // Check if the new bid changed any ranking
            // If new bid rank is different from total bid count, someone moved up/down
            long totalBids = bidRepository.countByRfq(rfq);
            // If there's more than 1 bid, and new bid is not at the very bottom, ranks changed
            if (newBid.getRank() < totalBids) {
                shouldExtend = true;
                reason = "Supplier rank changed — " + newBid.getSupplierName() + " moved to L" + newBid.getRank();
            }

        } else if (triggerType.equals("L1_RANK_CHANGE")) {
            // Rule: Extension ONLY if the L1 (lowest bidder) changed
            // If new bid has rank 1, it means this supplier is now the new L1
            if (newBid.getRank() == 1) {
                shouldExtend = true;
                reason = newBid.getSupplierName() + " became new L1 (lowest bidder)";
            }
        }

        // If extension is needed, do it
        if (shouldExtend) {
            extendAuction(rfq, reason);
        }
    }

    // EXTEND AUCTION — adds time but respects forced close
    private void extendAuction(RFQ rfq, String reason) {
        // Calculate the new close time by adding extension duration
        LocalDateTime currentClose = rfq.getBidCloseTime();
        LocalDateTime newCloseTime = currentClose.plusMinutes(rfq.getExtensionDurationMinutes());

        // CRITICAL RULE: Never extend beyond forced close time
        if (newCloseTime.isAfter(rfq.getForcedCloseTime())) {
            // Cap it at forced close time
            newCloseTime = rfq.getForcedCloseTime();
        }

        // If new close time equals current close time, no point extending
        if (newCloseTime.equals(currentClose)) {
            rfqService.logActivity(rfq, "EXTENSION_BLOCKED",
                    "Extension blocked — already at Forced Close Time");
            return;
        }

        // Update the close time
        rfq.setBidCloseTime(newCloseTime);
        rfq.setExtensionCount(rfq.getExtensionCount() + 1); // Increment counter
        rfqRepository.save(rfq);

        // Log the extension with reason
        rfqService.logActivity(rfq, "AUCTION_EXTENDED",
                "Auction extended to " + newCloseTime + " | Reason: " + reason);
    }

    // GET all bids for a specific RFQ (sorted by price)
    public List<Bid> getBidsForRFQ(Long rfqId) {
        RFQ rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new RuntimeException("RFQ not found"));
        return bidRepository.findByRfqOrderByTotalAmountAsc(rfq);
    }
}