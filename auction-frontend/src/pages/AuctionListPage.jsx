import { useState, useEffect } from 'react';


import { useNavigate } from 'react-router-dom';


import { getAllRFQs } from '../services/api';

// Import reusable components we built
import StatusBadge from '../components/StatusBadge';
import CountdownTimer from '../components/CountdownTimer';

function AuctionListPage() {

  const [auctions, setAuctions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAuctions();
  }, []); // [] means only run once on mount

  // Function to load auctions from Spring Boot
  const fetchAuctions = async () => {
    try {
      setLoading(true);          
      const data = await getAllRFQs(); 
      setAuctions(data);  
    } catch (err) {
      setError('Failed to load auctions. Is the backend running?');
    } finally {
      setLoading(false);         
    }
  };


  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading auctions...</p>
      </div>
    );
  }

  // Show error message if something went wrong
  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  // Main render — the actual auction list
  return (
    <div className="container mt-4">

      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📋 All British Auctions</h2>
        {/* Button navigates to Create RFQ page */}
        <button
          className="btn btn-primary"
          onClick={() => navigate('/create')}
        >
          + Create New RFQ
        </button>
      </div>

      {/* If no auctions exist, show a message */}
      {auctions.length === 0 ? (
        <div className="alert alert-info">
          No auctions found. Create your first RFQ!
        </div>
      ) : (
        /* Table showing all auctions */
        <div className="table-responsive">
          <table className="table table-hover table-bordered">
            <thead className="table-dark">
              <tr>
                <th>RFQ ID</th>
                <th>RFQ Name</th>
                <th>Status</th>
                <th>Bid Close Time</th>
                <th>Forced Close</th>
                <th>Time Remaining</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* .map() loops through the auctions array */}
              {/* For each auction object, it renders one <tr> row */}
              {auctions.map((auction) => (
                // key={auction.id} is REQUIRED by React to track list items
                <tr key={auction.id}>
                  <td><code>{auction.referenceId}</code></td>
                  <td>{auction.rfqName}</td>

                  {/* StatusBadge component shows ACTIVE/CLOSED/FORCE_CLOSED */}
                  <td><StatusBadge status={auction.status} /></td>

                  {/* Format the datetime for display */}
                  <td>{new Date(auction.bidCloseTime).toLocaleString()}</td>
                  <td>{new Date(auction.forcedCloseTime).toLocaleString()}</td>

                  {/* CountdownTimer shows live ticking countdown */}
                  <td>
                    <CountdownTimer
                      closeTime={auction.bidCloseTime}
                      status={auction.status}
                    />
                  </td>

                  <td>
                    {/* View button — navigates to /auction/5 (for auction with id=5) */}
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => navigate(`/auction/${auction.id}`)}
                    >
                      View
                    </button>

                    {/* Submit Bid button — only show if auction is ACTIVE */}
                    {auction.status === 'ACTIVE' && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => navigate(`/bid/${auction.id}`)}
                      >
                        Submit Bid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AuctionListPage;