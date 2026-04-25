import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import all our page components
import AuctionListPage from './pages/AuctionListPage';
import CreateRFQPage from './pages/CreateRFQPage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import SubmitBidPage from './pages/SubmitBidPage';

// Import the Navbar that shows on every page
import Navbar from './components/Navbar';

function App() {
  return (
    // BrowserRouter wraps everything — gives access to routing features
    <BrowserRouter>

      {/* Navbar appears on ALL pages because it's outside <Routes> */}
      <Navbar />

      {/* Routes: React looks at the current URL and renders the matching component */}
      <Routes>

        {/* URL: /         → Show AuctionListPage */}
        <Route path="/" element={<AuctionListPage />} />

        {/* URL: /create   → Show CreateRFQPage */}
        <Route path="/create" element={<CreateRFQPage />} />

        {/* URL: /auction/5 → Show AuctionDetailPage for RFQ with id=5 */}
        {/* :id is a URL parameter — we can read it inside the component */}
        <Route path="/auction/:id" element={<AuctionDetailPage />} />

        {/* URL: /bid/5    → Show SubmitBidPage for RFQ with id=5 */}
        <Route path="/bid/:rfqId" element={<SubmitBidPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App; 