import { Link } from 'react-router-dom';

function Navbar() {
  return (
   
    <nav className="navbar navbar-dark bg-dark px-4">

      {/* Brand/logo on the left */}
      {/* Link to="/" means clicking this takes you to the home page */}
      <Link to="/" className="navbar-brand fw-bold text-white">
        🏷️ British Auction System
      </Link>

      {/* Navigation links on the right */}
      <div className="d-flex gap-3">

        {/* Link to the auction list page */}
        <Link to="/" className="text-white text-decoration-none">
          All Auctions
        </Link>

        {/* Link to create a new RFQ */}
        <Link to="/create" className="btn btn-outline-light btn-sm">
          + Create RFQ
        </Link>

      </div>
    </nav>
  );
}

export default Navbar;