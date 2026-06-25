import React from "react";
import PropTypes from "prop-types";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Label.css";

const Label = ({ text, className, required }) => {
  const hasColon = text.trim().endsWith(":");
  const labelText = hasColon ? text.trim().slice(0, -1) : text;
  const colon = hasColon ? ":" : "";

  return (
    <label className={`label d-block w-md-auto ${className}`}>
      {labelText}
      {required && <span style={{ color: "red" }}> *</span>}
      {colon && <span style={{ marginLeft: "10px" }}>{colon}</span>}
    </label>
  );
};

Label.propTypes = {
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
  required: PropTypes.bool,
};

Label.defaultProps = {
  className: "",
  required: false,
};

export default Label;
