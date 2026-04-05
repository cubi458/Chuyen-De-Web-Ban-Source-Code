import React from "react";

function StoreFooter() {
  return (
    <footer className="footer" style={{ backgroundColor: "#111", color: "#fff" }}>
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
        <div className="py-2">
          <h6 className="text-uppercase mb-0">App Bán Source Code</h6>
          <small className="text-muted">Thư viện source code chất lượng cho team dev & agency.</small>
        </div>
        <div className="py-2 text-uppercase small">
          © {new Date().getFullYear()} App Bán Source Code. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default StoreFooter;
