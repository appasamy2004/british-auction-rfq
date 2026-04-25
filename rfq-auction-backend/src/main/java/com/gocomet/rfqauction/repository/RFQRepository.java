package com.gocomet.rfqauction.repository;

import com.gocomet.rfqauction.entity.RFQ;
import com.gocomet.rfqauction.entity.RFQ;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface RFQRepository extends JpaRepository<RFQ, Long> {

    List<RFQ> findByStatus(String status);
    RFQ findByReferenceId(String referenceId);
}
