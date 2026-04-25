package com.gocomet.rfqauction.repository;


import com.gocomet.rfqauction.entity.Bid;
import com.gocomet.rfqauction.entity.RFQ;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {

    List<Bid> findByRfqOrderByTotalAmountAsc(RFQ rfq);

    List<Bid> findByRfqAndSubmittedAtAfter(RFQ rfq, LocalDateTime time);

    long countByRfq(RFQ rfq);
}