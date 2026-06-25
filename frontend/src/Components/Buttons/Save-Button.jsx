// Button.js
import React from "react";
import PropTypes from "prop-types";
import "./styles.css";

const Save = ({ label, onClick }) => (
  <button className="custom-button" onClick={onClick}>
    <label className="custom-label">{label}</label>
  </button>
);

Save.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Save;
