# 🏷️ British Auction RFQ System

A full stack freight logistics platform where companies post **Request for Quotations (RFQs)** and freight suppliers submit competitive bids. Built with **Spring Boot** backend and **React** frontend, featuring a **British Auction mechanism** that automatically extends the auction deadline to prevent last-second sniping.

---

## 🚀 Live Demo

> Backend: http://localhost:8080
> Frontend:  http://localhost:3000

---

## 📌 What is a British Auction?

In a normal auction, the deadline is fixed. In a **British Auction**:

- If a bid arrives within the last **X minutes** before closing → the deadline automatically extends by **Y minutes**
- Extensions are capped by a **Forced Close Time** — a hard absolute deadline the auction can never cross
- This prevents suppliers from waiting until the last second to bid, giving others a fair chance to respond

---

## 🧠 Features

- ✅ Create RFQs with configurable auction timing and British Auction rules
- ✅ Suppliers submit bids with freight, origin, and destination charges
- ✅ Automatic **L1–Ln ranking** recalculated after every bid (lowest total = L1)
- ✅ Three configurable **extension trigger rules**:
  - BID_RECEIVED — any bid in trigger window extends the auction
  - ANY_RANK_CHANGE — extends if any supplier ranking changed
  - L1_RANK_CHANGE — extends only if the cheapest bidder (L1) changed
- ✅ Hard **Forced Close Time** cap — auction never extends beyond this
- ✅ Background **scheduler** auto-closes expired auctions every 60 seconds
- ✅ **Activity log** — full audit trail of every event (bid, extension, closure)
- ✅ React frontend with **live countdown timer** and **auto-refreshing** bid leaderboard

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Java 21 | Core language |
| Spring Boot 4.0.6 | REST API framework |
| Spring Data JPA + Hibernate | ORM — database operations |
| MySQL | Relational database |
| Lombok | Reduce boilerplate |
| Spring Scheduling | Background auction closer |
| Maven | Build tool |

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| React Router v7 | Client-side routing |
| Axios | HTTP client for API calls |
| Bootstrap 5 | UI styling |

---

## 🗄️ Database Schema

### 3 Tables

**rfq** — Stores each auction

id, rfq_name, reference_id (unique), bid_start_time, bid_close_time,
forced_close_time, pickup_date, trigger_window_minutes,
extension_duration_minutes, extension_trigger, status, extension_count


**bids** — Stores every supplier bid

id, rfq_id (FK), supplier_name, freight_charges, origin_charges,
destination_charges, total_amount, transit_time, quote_validity,
submitted_at, bid_rank


**activity_log** — Audit trail of all events

id, rfq_id (FK), event_type, description, timestamp


### Relationships

rfq (1) ──────< bids (many)
rfq (1) ──────< activity_log (many)




## 📡 REST API Endpoints

### RFQ Endpoints
| Method | URL | Description |
|---|---|---|
| POST | /api/rfq/create | Create a new RFQ |
| GET | /api/rfq/all | Get all RFQs |
| GET | /api/rfq/{id} | Get single RFQ by ID |
| GET | /api/rfq/{id}/bids | Get all bids ranked by price |
| GET | /api/rfq/{id}/logs | Get activity log (newest first) |

### Bid Endpoints
| Method | URL | Description |
|---|---|---|
| POST | /api/bid/submit | Submit a new bid |


## 🔄 How Bid Submission Works


Supplier submits bid
        ↓
Validate auction is ACTIVE + time not passed
        ↓
Calculate total = freight + origin + destination
        ↓
Save bid to database
        ↓
Recalculate L1–Ln rankings for all bids
        ↓
Check if bid is inside trigger window
        ↓
If yes → check extension rule → extend close time if conditions met
        ↓
Log every event in activity_log
        ↓
Return saved bid as JSON




## 📁 Project Structure


british-auction-rfq/
├── rfq-auction-backend/
│   └── src/main/java/com/gocomet/rfqauction/
│       ├── controller/
│       │   ├── RFQController.java
│       │   └── BidController.java
│       ├── service/
│       │   ├── RFQService.java
│       │   └── BidService.java
│       ├── entity/
│       │   ├── RFQ.java
│       │   ├── Bid.java
│       │   └── ActivityLog.java
│       ├── repository/
│       │   ├── RFQRepository.java
│       │   ├── BidRepository.java
│       │   └── ActivityLogRepository.java
│       ├── dto/
│       │   ├── RFQRequest.java
│       │   └── BidRequest.java
│       ├── scheduler/
│       │   └── AuctionScheduler.java
│       └── RfqAuctionBackendApplication.java
│
└── auction-frontend/
    └── src/
        ├── pages/
        │   ├── AuctionListPage.jsx
        │   ├── AuctionDetailPage.jsx
        │   ├── CreateRFQPage.jsx
        │   └── SubmitBidPage.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── CountdownTimer.jsx
        │   └── StatusBadge.jsx
        ├── services/
        │   └── api.js
        └── App.js



## ⚙️ Setup and Run

### Prerequisites
- Java 21
- Node.js 18+
- MySQL 8+
- Maven

### Step 1 — Create Database
sql
CREATE DATABASE british_auction;


### Step 2 — Configure Backend
Edit rfq-auction-backend/src/main/resources/application.properties:
properties
spring.datasource.url=jdbc:mysql://localhost:3306/british_auction
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update


### Step 3 — Run Backend
   bash
cd rfq-auction-backend
./mvnw spring-boot:run

Backend starts on http://localhost:8080

### Step 4 — Run Frontend
   bash
cd auction-frontend
npm install
npm start

Frontend starts on http://localhost:3000

## 🖥️ Pages

| Page | URL | Description |
|---|---|---|
| Auction List | / | All auctions with live countdown timers |
| Create RFQ | /create | Form to create new auction |
| Auction Detail | /auction/:id | Bid leaderboard + activity log, auto-refreshes every 5s |
| Submit Bid | /bid/:rfqId | Supplier bid form with live total calculation |

---

## 📊 Auction Status Flow


Created → ACTIVE
              ↓
    bid_close_time passed → CLOSED
              ↓
    forced_close_time passed → FORCE_CLOSED




## 🔑 Key Design Decisions

- **@Transactional on submitBid** — bid save + rank update + activity log + extension update are all atomic. If any step fails, everything rolls back.
- **Two close times** —bid_close_time is the moving target (extends), forced_close_time is the absolute wall.
- **DTOs instead of Entities** — prevents clients from setting server-controlled fields like status, extensionCount, totalAmount, rank.
- **Server-side total calculation** — totalAmount is computed on the backend, never trusted from the client.
- **Scheduler + time check** — scheduler closes auctions every 60s, but submitBid  also checks time directly to reject bids in the gap window.

---

## 👨‍💻 Author

**Appasamy M**  
B.Tech – AI & ML | St. Joseph's College of Engineering, Chennai  
[GitHub](https://github.com/appasamy2004) · [LinkedIn](https://linkedin.com/in/appasamy-m) · [LeetCode](https://leetcode.com/u/Appasamy/)
