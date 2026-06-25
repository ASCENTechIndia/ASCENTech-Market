import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./LinkButton.css";

const LinkButton = ({
  text,
  to,
  onClick,
  customClass = "",
  type = "button",
}) => {
  return (
    <button
      className={`link-button w-md-auto ${customClass}`}
      onClick={onClick}
      type={type} // ✅ Set button type (default to "button")
    >
      {to ? (
        <Link to={to} className="btn-link">
          {text}
        </Link> // ✅ Ensuring proper styling
      ) : (
        text
      )}
    </button>
  );
};

export default LinkButton;
