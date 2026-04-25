import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRFQ } from '../services/api';

function CreateRFQPage() {

  const navigate = useNavigate();

 
  const [formData, setFormData] = useState({
    rfqName: '',
    referenceId: '',
    bidStartTime: '',
    bidCloseTime: '',
    forcedCloseTime: '',
    pickupDate: '',
    triggerWindowMinutes: 10,    
    extensionDurationMinutes: 5,  
    extensionTrigger: 'BID_RECEIVED'
  });


  const [submitting, setSubmitting] = useState(false);

 
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(formData.forcedCloseTime) <= new Date(formData.bidCloseTime)) {
      setError('Forced Close Time must be AFTER Bid Close Time');
      return; // Stop here — don't submit
    }

    try {
      setSubmitting(true);
      setError('');

      const created = await createRFQ(formData);

      // If successful, go to the detail page of the newly created RFQ
      navigate(`/auction/${created.id}`);

    } catch (err) {
      
      setError(err.response?.data || 'Failed to create RFQ. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '700px' }}>
      <h2 className="mb-4">📝 Create New RFQ (British Auction)</h2>

      {/* Show error message if exists */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* onSubmit calls handleSubmit when form is submitted */}
      <form onSubmit={handleSubmit}>

        {/* ── RFQ Basic Info ───────────────────────────── */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            Basic Information
          </div>
          <div className="card-body">

            {/* RFQ Name field */}
            <div className="mb-3">
              <label className="form-label fw-bold">RFQ Name *</label>
              <input
                type="text"
                className="form-control"
                name="rfqName"          
                value={formData.rfqName} 
                onChange={handleChange} 
                placeholder="e.g. Freight RFQ - Mumbai to Delhi"
                required                
              />
            </div>

            {/* Reference ID field */}
            <div className="mb-3">
              <label className="form-label fw-bold">Reference ID *</label>
              <input
                type="text"
                className="form-control"
                name="referenceId"
                value={formData.referenceId}
                onChange={handleChange}
                placeholder="e.g. RFQ-2024-001"
                required
              />
            </div>

          </div>
        </div>

        {/* ── Timing Fields ────────────────────────────── */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            Auction Timing
          </div>
          <div className="card-body">

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Bid Start Time *</label>
                {/* datetime-local input shows a date+time picker */}
                <input
                  type="datetime-local"
                  className="form-control"
                  name="bidStartTime"
                  value={formData.bidStartTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Bid Close Time *</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="bidCloseTime"
                  value={formData.bidCloseTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold text-danger">
                  Forced Close Time * (Hard deadline)
                </label>
                <input
                  type="datetime-local"
                  className="form-control border-danger"
                  name="forcedCloseTime"
                  value={formData.forcedCloseTime}
                  onChange={handleChange}
                  required
                />
                <small className="text-muted">
                  Auction NEVER extends beyond this time
                </small>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Pickup / Service Date</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="pickupDate"
                  value={formData.pickupDate}
                  onChange={handleChange}
                />
              </div>
            </div>

          </div>
        </div>

        {/* ── British Auction Configuration ─────────────── */}
        <div className="card mb-4">
          <div className="card-header bg-warning text-dark">
            ⚙️ British Auction Configuration
          </div>
          <div className="card-body">

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  Trigger Window (X Minutes) *
                </label>
                <input
                  type="number"
                  className="form-control"
                  name="triggerWindowMinutes"
                  value={formData.triggerWindowMinutes}
                  onChange={handleChange}
                  min="1"
                  max="60"
                  required
                />
                <small className="text-muted">
                  Monitor bids in last X minutes before close
                </small>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  Extension Duration (Y Minutes) *
                </label>
                <input
                  type="number"
                  className="form-control"
                  name="extensionDurationMinutes"
                  value={formData.extensionDurationMinutes}
                  onChange={handleChange}
                  min="1"
                  max="30"
                  required
                />
                <small className="text-muted">
                  Add Y minutes when trigger condition is met
                </small>
              </div>
            </div>

            {/* Extension Trigger dropdown */}
            <div className="mb-3">
              <label className="form-label fw-bold">Extension Trigger *</label>
              {/* select = dropdown menu */}
              <select
                className="form-select"
                name="extensionTrigger"
                value={formData.extensionTrigger}
                onChange={handleChange}
                required
              >
                {/* Each option value matches what our Spring Boot backend expects */}
                <option value="BID_RECEIVED">
                  Any Bid Received in Last X Minutes
                </option>
                <option value="ANY_RANK_CHANGE">
                  Any Supplier Rank Change in Last X Minutes
                </option>
                <option value="L1_RANK_CHANGE">
                  Lowest Bidder (L1) Changes in Last X Minutes
                </option>
              </select>
            </div>

          </div>
        </div>

        {/* Submit button */}
        <div className="d-flex gap-3">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting} // Disable while submitting to prevent double-click
          >
            {/* Show different text while submitting */}
            {submitting ? '⏳ Creating...' : '✅ Create RFQ'}
          </button>

          {/* Cancel goes back to home page */}
          <button
            type="button"
            className="btn btn-outline-secondary btn-lg"
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}

export default CreateRFQPage;