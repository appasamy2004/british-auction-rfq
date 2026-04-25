import React from 'react';

// ReactDOM connects React to the actual browser HTML
import ReactDOM from 'react-dom/client';

// Our main App component that contains everything
import App from './App';

// Bootstrap CSS for basic styling (buttons, tables, forms look nice)
import 'bootstrap/dist/css/bootstrap.min.css';

// Find the <div id="root"> in public/index.html and mount our React app there
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render our App component inside the root div
// StrictMode helps catch bugs during development (shows extra warnings)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
