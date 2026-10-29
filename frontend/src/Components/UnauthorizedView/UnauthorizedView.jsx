import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import "./UnauthorizedView.css";

const UnauthorizedView = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-backdrop"></div>
      <div className="unauthorized-card">
        <div className="unauthorized-icon-wrapper">
          <div className="unauthorized-icon-ring"></div>
          <svg
            className="unauthorized-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="unauthorized-title">Access Denied</h1>
        <p className="unauthorized-message">
Please log in with an authorized account or contact the administrator for access of this page.     
        </p>
        <div className="unauthorized-divider"></div>
        <div className="unauthorized-actions">
          <button
            onClick={() => navigate("/HomePage/Dashboard")}
            className="btn btn-unauthorized-primary"
          >
            Go to Dashboard
          </button>
          <button
            onClick={logout}
            className="btn btn-unauthorized-secondary"
          >
            Logout & Switch User
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedView;
