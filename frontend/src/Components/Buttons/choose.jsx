import React from "react";
import "./choose.css";

const Choose = ({ label, onClick }) => (
  <button className="custom-button" onClick={onClick}>
    <label className="custom-label">{label}</label>
  </button>
);

export default Choose;
