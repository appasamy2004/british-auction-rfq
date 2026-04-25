package com.gocomet.rfqauction;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RfqAuctionBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(RfqAuctionBackendApplication.class, args);
	}

}
