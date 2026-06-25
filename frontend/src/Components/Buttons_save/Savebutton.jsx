import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Savebutton.css";

const SaveButton = ({
  text,
  to,
  onClick,
  customClass = "",
  type = "button",
  disabled = false, // ✅ Accept disabled prop
}) => {
  return (
    <button
      className={`save-button btn w-md-auto ${customClass}`}
      onClick={onClick}
      type={type}
      disabled={disabled} // ✅ Apply disabled here
    >
      {to ? (
        <Link to={to} className={`btn-link ${disabled ? "disabled-link" : ""}`}>
          {text}
        </Link>
      ) : (
        text
      )}
    </button>
  );
};

export default SaveButton;
