//logout button component HOC
import React from "react";
import "./LogOut.css";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageProvider";
import useIP from "../../Hooks/UseIp";
import Cookies from "js-cookie";
import { useAuth } from "../../Context/AuthContext";

const LogOut = () => {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { translate } = useLanguage();
  const { user } = useAuth();
  const ipAddress = useIP();

  const handleLogout = async () => {
    const userId = localStorage.getItem("userId");

    localStorage.clear();

    const requestBody = {
      in_UserId: userId,
      in_ipaddr: ipAddress,
      in_source: "web",
    };

    try {
     
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      console.log(requestBody);
      if (response.ok) {
        console.log("Logout successful");

        // Remove cookies on successful logout
        Cookies.remove("token", { path: "/" });
        Cookies.remove("username", { path: "/" });
        Cookies.remove("deptId", { path: "/" });
        localStorage.removeItem("username", { path: "/" });
        localStorage.removeItem("token", { path: "/" });
        localStorage.removeItem("deptId", { path: "/" });
        localStorage.removeItem("ulbId", { path: "/" });
        localStorage.clear();
        // Redirect
        // Redirect to home page
        navigate("/");
      } else {
        console.error("Logout failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div
      onClick={handleLogout}
      className="d-flex justify-content-center justify-content-lg-end p-1"
    >
      <button
        className="btn btn-sm"
        style={{ backgroundColor: "#F25019", color: "white" }}
      >
        {translate("Log Out")}
      </button>
    </div>
  );
};

export default LogOut;
