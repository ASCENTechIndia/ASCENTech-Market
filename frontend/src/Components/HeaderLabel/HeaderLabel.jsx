import React from "react";
import PropTypes from "prop-types";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HeaderLabel.css"; // Ensure the path is correct

const HeaderLabel = ({ text, className }) => {
  return (
    <label className={`headerlabel d-block w-100 w-md-auto  ${className}`}>
      {text}
    </label>
  );
};

HeaderLabel.propTypes = {
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
};

HeaderLabel.defaultProps = {
  className: "",
};

export default HeaderLabel;
