import React, { useEffect, useState } from "react";
import UserWelcome from "../../Components/UserWelcome/UserWelcome";
import UserIcon from "../../Components/UserIcon/UserIcon";
import LogOut from "../../Components/LogOutButton/LogOut";
import "./Header.css";
import Cookies from "js-cookie";

const Header = () => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    // ✅ Retrieve username from localStorage
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <div className="header-content">
      <UserWelcome username={username} />
      <UserIcon />
      <LogOut />
    </div>
  );
};

export default Header;
