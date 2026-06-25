import React, { useEffect, useState, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./Navbar.css";
import NavDropdown from "../../Components/NavDropdown/NavDropdown";
import TimeComponent from "../../Components/Time/Time";
import NavbarLogo from "../../Components/NavbarLogo/NavbarLogo";
import NavbarText from "../../Components/NavbarText/NavbarText";

import axios from "axios";
import { useAuth } from "../../Context/AuthContext";
import config from "../../utils/config";
const Navbar = () => {
  const { user } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [menuItems, setMenuItems] = useState([]);
  const [logoUrl, setLogoUrl] = useState("");
  const [navbarText] = useState({ text1: "", text2: "" });

  const userId = localStorage.getItem("userId");
  const ulbId = localStorage.getItem("ulbId");
  const deptId = config.deptId;
  const lastLogin = user?.lastLogin || "N/A";
  const lastLogout = user?.lastLogout || "N/A";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    let dateObj;
    if (dateString.includes("T")) {
      dateObj = new Date(dateString);
    } else {
      const parts = dateString.split(" ");
      if (parts.length === 3) {
        const [day, month, year] = parts[0].split("-").map(Number);
        const time = parts[1] + " " + parts[2];
        if (day && month && year) {
          const formattedDateString = `${year}-${month
            .toString()
            .padStart(2, "0")}-${day.toString().padStart(2, "0")} ${time}`;
          dateObj = new Date(formattedDateString);
        }
      }
    }
    if (!dateObj || isNaN(dateObj.getTime())) {
      // console.error("Invalid date format:", dateString);
      return "Invalid Date";
    }
    return dateObj.toLocaleString("en-IN", { hour12: true });
  };
  const fetchMenus = useCallback(async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/MarketMenus`, // Your API endpoint for POST
        {
          // Request body for POST
          userId: userId,
          ulbId: ulbId,
          deptId: deptId,
        }
      );
      const allMenus = response.data?.data || [];

      if (!Array.isArray(allMenus)) {
        console.error("API response is not an array:", allMenus);
        return;
      }

      // Create a menu map for structured hierarchy
      const menuMap = {};
      allMenus.forEach((menu) => {
        menuMap[menu.MENUID] = { ...menu, children: [] };
      });

      // Organize menus into hierarchical structure
      const structuredMenus = [];
      allMenus.forEach((menu) => {
        if (menu.PARENTID === 0) {
          structuredMenus.push(menuMap[menu.MENUID]);
        } else {
          menuMap[menu.PARENTID]?.children.push(menuMap[menu.MENUID]);
        }
      });

      setMenuItems(structuredMenus);
    } catch (error) {
      console.error(
        "Error fetching menus:",
        error.response?.data || error.message
      );
    }
  }, [API_BASE_URL]);

  // Fetch Logo and Navbar Text
  const fetchLogo = useCallback(async () => {
    if (!ulbId) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/textlogo/${ulbId}`);
      if (response.data.success) {
        const { ULBLOGO, ABC_MUNICIPAL_TEXT, MARRIAGE_REGISTRATION_TEXT } =
          response.data.data;
        setLogoUrl(ULBLOGO);
      }
    } catch (error) {
      console.error("Error fetching logo and text:", error);
    }
  }, [ulbId]);

  useEffect(() => {
    if (userId && deptId && ulbId) {
      fetchMenus();
      fetchLogo();
    }
  }, [userId, deptId, ulbId, fetchMenus, fetchLogo]);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm w-100">
      <div className="d-flex align-items-center gap-3">
        <NavbarLogo src={logoUrl} />
      </div>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <NavbarText text1={navbarText.text1} text2={navbarText.text2} />
        <ul className="navbar-nav">
          <li className="nav-item">
            <a className="nav-link " href="/HomePage/Dashboard.aspx">
              Home
            </a>
          </li>
          {menuItems.map((menu) => (
            <li className="nav-item dropdown" key={menu.MENUID}>
              <a
                className="nav-link dropdown-toggle"
                href={menu.PAGEPATH || "#"}
                data-bs-toggle={menu.children.length > 0 ? "dropdown" : ""}
              >
                {menu.MENUTITLE}
              </a>
              {menu.children.length > 0 && (
                <ul className="dropdown-menu">
                  {menu.children.map((subMenu) => (
                    <li key={subMenu.MENUID}>
                      <a
                        className="dropdown-item"
                        href={subMenu.PAGEPATH || "#"}
                      >
                        {subMenu.MENUTITLE}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        <div className="d-flex flex-column align-items-lg-end text-center text-lg-end ms-auto">
          <TimeComponent
            lastLogin={formatDate(lastLogin)}
            lastLogout={formatDate(lastLogout)}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
