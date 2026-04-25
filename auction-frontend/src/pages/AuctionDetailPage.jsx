import { useState, useEffect } from 'react';


import { useParams, useNavigate } from 'react-router-dom';

import { getRFQById, getBidsForRFQ, getLogsForRFQ } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import CountdownTimer from '../components/CountdownTimer';

function AuctionDetailPage() {

  const { id } = useParams();   
  const navigate = useNavigate();

  // State for different pieces of data
  const [rfq, setRfq] = useState(null);      
  const [bids, setBids] = useState([]);        
  const [logs, setLogs] = useState([]);       
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchAllData = async () => {
    try {
 
      const [rfqData, bidsData, logsData] = await Promise.all([
        getRFQById(id),
        getBidsForRFQ(id),
        getLogsForRFQ(id)
      ]);

      setRfq(rfqData);
      setBids(bidsData);
      setLogs(logsData);
    } catch (err) {
      setError('Failed to load auction details');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAllData();  // First load immediately

   
    const interval = setInterval(fetchAllData, 5000);

   
    return () => clearInterval(interval);
  }, [id]); // Re-run if the id in URL changes

  // Show loading while first fetch is happening
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary"></div>
        <p className="mt-2">Loading auction details...</p>
      </div>
    );
  }

  if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;
  if (!rfq) return <div className="container mt-4 alert alert-warning">Auction not found</div>;

  return (
    <div className="container mt-4">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2>{rfq.rfqName}</h2>
          <code className="text-muted">{rfq.referenceId}</code>
        </div>
        <div className="text-end">
          {/* Status badge and timer side by side */}
          <StatusBadge status={rfq.status} />
          <div className="mt-1">
            <CountdownTimer closeTime={rfq.bidCloseTime} status={rfq.status} />
          </div>
        </div>
      </div>

      <div className="row">

        {/* ── Left Column ────────────────────────────────── */}
        <div className="col-md-8">

          {/* RFQ Details Card */}
          <div className="card mb-4">
            <div className="card-header bg-dark text-white">📋 Auction Details</div>
            <div className="card-body">
              <div className="row">
                <div className="col-6">
                  <p><strong>Bid Start:</strong><br/>
                    {new Date(rfq.bidStartTime).toLocaleString()}
                  </p>
                  <p><strong>Current Close Time:</strong><br/>
                    <span className="text-primary fw-bold">
                      {new Date(rfq.bidCloseTime).toLocaleString()}
                    </span>
                  </p>
                </div>
                <div className="col-6">
                  <p><strong>Forced Close Time:</strong><br/>
                    <span className="text-danger fw-bold">
                      {new Date(rfq.forcedCloseTime).toLocaleString()}
                    </span>
                  </p>
                  <p><strong>Extensions So Far:</strong><br/>
                    {rfq.extensionCount} time(s)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bids Table */}
          <div className="card mb-4">
            <div className="card-header bg-success text-white">
              🏆 Supplier Bids (Ranked by Price)
            </div>
            <div className="card-body">
              {bids.length === 0 ? (
                <p className="text-muted text-center">No bids submitted yet</p>
              ) : (
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Rank</th>
                      <th>Supplier</th>
                      <th>Freight</th>
                      <th>Origin</th>
                      <th>Destination</th>
                      <th>Total</th>
                      <th>Transit Days</th>
                      <th>Validity</th>
                      <th>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map((bid, index) => (
                      <tr
                        key={bid.id}
                        // Highlight L1 (lowest bid) row in light green
                        className={bid.rank === 1 ? 'table-success' : ''}
                      >
                        {/* Rank badge: L1 gets gold, others normal */}
                        <td>
                          <span className={`badge ${
                            bid.rank === 1 ? 'bg-warning text-dark' :
                            bid.rank === 2 ? 'bg-secondary' : 'bg-light text-dark'
                          }`}>
                            L{bid.rank}
                          </span>
                        </td>
                        <td className="fw-bold">{bid.supplierName}</td>
                        <td>₹{bid.freightCharges?.toLocaleString()}</td>
                        <td>₹{bid.originCharges?.toLocaleString()}</td>
                        <td>₹{bid.destinationCharges?.toLocaleString()}</td>
                        {/* Total is bold */}
                        <td className="fw-bold text-success">
                          ₹{bid.totalAmount?.toLocaleString()}
                        </td>
                        <td>{bid.transitTime} days</td>
                        <td>{bid.quoteValidity}</td>
                        <td>
                          <small>{new Date(bid.submittedAt).toLocaleTimeString()}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>

        {/* ── Right Column ─────────────────────────────────── */}
        <div className="col-md-4">

          {/* Auction Configuration Card */}
          <div className="card mb-4">
            <div className="card-header bg-warning text-dark">
              ⚙️ Auction Configuration
            </div>
            <div className="card-body">
              <p>
                <strong>Trigger Window:</strong><br/>
                Last {rfq.triggerWindowMinutes} minutes before close
              </p>
              <p>
                <strong>Extension Duration:</strong><br/>
                +{rfq.extensionDurationMinutes} minutes per trigger
              </p>
              <p>
                <strong>Extension Rule:</strong><br/>
                {rfq.extensionTrigger === 'BID_RECEIVED' && '📥 Any Bid Received'}
                {rfq.extensionTrigger === 'ANY_RANK_CHANGE' && '🔀 Any Rank Change'}
                {rfq.extensionTrigger === 'L1_RANK_CHANGE' && '👑 L1 Rank Change Only'}
              </p>
            </div>
          </div>

          {/* Activity Log Card */}
          <div className="card">
            <div className="card-header bg-info text-white">
              📜 Activity Log
            </div>
            <div className="card-body p-0">
              {logs.length === 0 ? (
                <p className="text-muted p-3">No activity yet</p>
              ) : (
                // Scrollable list of log entries
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2 border-bottom"
                      style={{ fontSize: '0.85rem' }}
                    >
                      {/* Icon based on event type */}
                      <span className="me-2">
                        {log.eventType === 'BID_SUBMITTED' && '💰'}
                        {log.eventType === 'AUCTION_EXTENDED' && '⏰'}
                        {log.eventType === 'AUCTION_CLOSED' && '🔒'}
                        {log.eventType === 'RFQ_CREATED' && '✅'}
                      </span>
                      <span>{log.description}</span>
                      <br/>
                      <small className="text-muted">
                        {new Date(log.timestamp).toLocaleString()}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Bid button if active */}
          {rfq.status === 'ACTIVE' && (
            <button
              className="btn btn-success w-100 mt-3 btn-lg"
              onClick={() => navigate(`/bid/${rfq.id}`)}
            >
              💰 Submit a Bid
            </button>
          )}

        </div>
      </div>

    </div>
  );
}

export default AuctionDetailPage;