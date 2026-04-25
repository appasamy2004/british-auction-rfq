import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRFQById, submitBid } from '../services/api';

function SubmitBidPage() {

  const { rfqId } = useParams();
  const navigate = useNavigate();


  const [rfq, setRfq] = useState(null);

  const [formData, setFormData] = useState({
    rfqId: rfqId,     
    supplierName: '',
    freightCharges: '',
    originCharges: '',
    destinationCharges: '',
    transitTime: '',
    quoteValidity: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load the RFQ details when page opens (to show auction name)
  useEffect(() => {
    getRFQById(rfqId)
      .then(data => setRfq(data))
      .catch(() => setError('Failed to load RFQ details'));
  }, [rfqId]);

 
  const calculateTotal = () => {
    const freight = parseFloat(formData.freightCharges) || 0;
    const origin = parseFloat(formData.originCharges) || 0;
    const destination = parseFloat(formData.destinationCharges) || 0;
    return (freight + origin + destination).toFixed(2);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError('');

     
      const bidPayload = {
        ...formData,
        rfqId: parseInt(rfqId),
        freightCharges: parseFloat(formData.freightCharges),
        originCharges: parseFloat(formData.originCharges) || 0,
        destinationCharges: parseFloat(formData.destinationCharges) || 0,
        transitTime: parseInt(formData.transitTime)
      };

     
      await submitBid(bidPayload);
      setSuccess(true);

      setTimeout(() => {
        navigate(`/auction/${rfqId}`);
      }, 2000);

    } catch (err) {
      setError(err.response?.data || 'Failed to submit bid. Auction may be closed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!rfq) return <div className="container mt-4">Loading...</div>;

  if (success) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-success p-5">
          <h3>✅ Bid Submitted Successfully!</h3>
          <p>Redirecting to auction details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: '600px' }}>

      {/* Show which auction we're bidding on */}
      <div className="alert alert-info mb-4">
        <strong>Bidding on:</strong> {rfq.rfqName}
        <span className="ms-2 badge bg-primary">{rfq.referenceId}</span>
      </div>

      <h3 className="mb-4"> Submit Your Bid</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>

        {/* Supplier Name */}
        <div className="mb-3">
          <label className="form-label fw-bold">Carrier / Supplier Name *</label>
          <input
            type="text"
            className="form-control"
            name="supplierName"
            value={formData.supplierName}
            onChange={handleChange}
            placeholder="e.g. BlueDart Logistics"
            required
          />
        </div>

        {/* Charge fields */}
        <div className="card mb-4">
          <div className="card-header">Charges (in ₹)</div>
          <div className="card-body">

            <div className="mb-3">
              <label className="form-label fw-bold">Freight Charges *</label>
              <input
                type="number"
                className="form-control"
                name="freightCharges"
                value={formData.freightCharges}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Origin Charges</label>
              <input
                type="number"
                className="form-control"
                name="originCharges"
                value={formData.originCharges}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Destination Charges</label>
              <input
                type="number"
                className="form-control"
                name="destinationCharges"
                value={formData.destinationCharges}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            {/* Live total calculation — updates as user types */}
            <div className="alert alert-success">
              <strong>Calculated Total: ₹{calculateTotal()}</strong>
            </div>

          </div>
        </div>

        {/* Transit & Validity */}
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label fw-bold">Transit Time (Days) *</label>
            <input
              type="number"
              className="form-control"
              name="transitTime"
              value={formData.transitTime}
              onChange={handleChange}
              placeholder="e.g. 3"
              min="1"
              required
            />
          </div>

          <div className="col-6 mb-3">
            <label className="form-label fw-bold">Quote Validity *</label>
            <input
              type="text"
              className="form-control"
              name="quoteValidity"
              value={formData.quoteValidity}
              onChange={handleChange}
              placeholder="e.g. 30 days"
              required
            />
          </div>
        </div>

        <div className="d-flex gap-3">
          <button
            type="submit"
            className="btn btn-success btn-lg"
            disabled={submitting}
          >
            {submitting ? '⏳ Submitting...' : '✅ Submit Bid'}
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary btn-lg"
            onClick={() => navigate(`/auction/${rfqId}`)}
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}

export default SubmitBidPage;