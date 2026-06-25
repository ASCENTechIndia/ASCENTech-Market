import React from "react";
import PropTypes from "prop-types";
import "./AgeInput.css";

const AgeInput = ({ value, placeholder, className }) => {
  return (
    <div className={`age-container ${className || ""}`}>
      <input 
        type="text"
        className="age-field"
        value={value}
        placeholder={placeholder}
        disabled // Prevent editing
      />
    </div>
  );
};

AgeInput.propTypes = {
  value: PropTypes.string.isRequired, // Age value (e.g., "31")
  placeholder: PropTypes.string, // Optional placeholder
  className: PropTypes.string, // Additional custom styles if needed
};

AgeInput.defaultProps = {
  placeholder: "--", // Default placeholder if value is empty
};

export default AgeInput;