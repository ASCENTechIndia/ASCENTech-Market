import React from "react";
import "./button.css";

const LoginButton = ({ text, onClick, type = "button", className = "" }) => {
  return (
    <button
      className={`custom-button ${className}`}
      type={type}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default LoginButton;
