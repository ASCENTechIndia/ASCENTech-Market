// Button.js
import React from "react";
import "./Download.css";

const Download = ({ label, onClick, disabled }) => {
  return (
    <button className="button" onClick={onClick} disabled={disabled}>
      <label className="custom-label">{label}</label>
    </button>
  );
};

export default Download;
