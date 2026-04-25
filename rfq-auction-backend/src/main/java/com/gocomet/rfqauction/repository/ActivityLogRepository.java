package com.gocomet.rfqauction.repository;


import com.gocomet.rfqauction.dto.RFQRequest;
import com.gocomet.rfqauction.entity.ActivityLog;
import com.gocomet.rfqauction.entity.RFQ;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findByRfqOrderByTimestampDesc(RFQ rfq);
}
