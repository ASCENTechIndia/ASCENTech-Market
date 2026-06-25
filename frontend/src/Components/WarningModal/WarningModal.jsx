import React from "react";
import thumb from "../../Assets/thumbs_up_icon.png";
import "./WarningModal.css";

const WarningModal = ({ message, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Icon Box */}
        <div className="icon-box">
          <img src={thumb} alt="Thumb Up" className="icon thumb-icon" />
        </div>

        {/* Header */}
        <h2 className="modal-header">abcmuncipalcouncil.com says</h2>

        {/* Dynamic Message */}
        <p className="modal-message">{message}</p>

        {/* Button */}
        <div className="modal-footer">
          <button className="modal-button" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;
