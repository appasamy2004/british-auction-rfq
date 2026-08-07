import axios from 'axios';

// BASE_URL = the address of our Spring Boot server
// All API calls will start with this URL
const BASE_URL = 'https://british-auction-rfq-1pht.onrender.com/api';

// ─── RFQ API FUNCTIONS ───────────────────────────────────────────

// Create a new RFQ
// rfqData = the form data object with all RFQ fields
export const createRFQ = async (rfqData) => {
  // axios.post sends a POST request with rfqData as JSON body
  // Spring Boot @PostMapping("/create") receives this
  const response = await axios.post(`${BASE_URL}/rfq/create`, rfqData);
  return response.data; // .data gives us the actual response JSON
};

// Get all RFQs (for the listing page)
export const getAllRFQs = async () => {
  // axios.get sends a GET request
  // Spring Boot @GetMapping("/all") receives this
  const response = await axios.get(`${BASE_URL}/rfq/all`);
  return response.data;
};

// Get a single RFQ by its ID
export const getRFQById = async (id) => {
  // Template literal: /rfq/1 or /rfq/5 depending on id
  const response = await axios.get(`${BASE_URL}/rfq/${id}`);
  return response.data;
};

// Get all bids for a specific RFQ
export const getBidsForRFQ = async (rfqId) => {
  const response = await axios.get(`${BASE_URL}/rfq/${rfqId}/bids`);
  return response.data;
};

// Get activity log for a specific RFQ
export const getLogsForRFQ = async (rfqId) => {
  const response = await axios.get(`${BASE_URL}/rfq/${rfqId}/logs`);
  return response.data;
};

// ─── BID API FUNCTIONS ────────────────────────────────────────────

// Submit a new bid
export const submitBid = async (bidData) => {
  const response = await axios.post(`${BASE_URL}/bid/submit`, bidData);
  return response.data;
};
