import React from "react";
import { FaUser } from "react-icons/fa"; // Import user icon from react-icons
import "./UserIcon.css";

const UserIcon = () => {
  return (
    <div className="user-icon-container d-flex justify-content-center align-items-center">
      <div className="user-icon p-2">
      <FaUser color="white" size="1rem" className="icon-size" />      </div>
    </div>
  );
};

export default UserIcon;