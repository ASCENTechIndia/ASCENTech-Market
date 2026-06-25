import React from "react";
import "./LoginCard.css";

const LoginCard = ({ children }) => {
  const cardStyle = {
    width: "90%", // Flexible width
    maxWidth: "450px", // Prevents it from getting too large
    minHeight: "425px", // Minimum height
    borderRadius: "25px",
    border: "2px solid black",
    backgroundColor: "rgba(236, 221, 221, 0.73)",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  };

  return <div className="Card" style={cardStyle}>{children}</div>;
};

export default LoginCard;