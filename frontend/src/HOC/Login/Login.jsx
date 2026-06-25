import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TextBox from "../../Components/TextBox/TextBox";
import AdminPortal from "../../../public/assets/Images/BgLoginWeb.jpg";
import "./login.css";
import LoginCard from "../../Components/Card/LoginCard";
import LoginButton from "../../Components/Buttons/button";
import NavbarText from "../../Components/NavbarText/NavbarText";
import NavbarLogo from "../../Components/NavbarLogo/NavbarLogo";
import Captcha from "../Captcha/Captcha";
import { useLanguage } from "../../Context/LanguageProvider";
// import { logError } from "../../logger"; // 🔹 Import the error logger
import { useAuth } from "../../Context/AuthContext";

const Login = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [captchaValid, setCaptchaValid] = useState(false);
  const { translate } = useLanguage();
  const [logoUrl, setLogoUrl] = useState("");
  const [error, setError] = useState(null);
  const [navbarText, setNavbarText] = useState({ text1: "", text2: "" });
  const navigate = useNavigate();
  const [realPassword, setRealPassword] = useState("");
const [displayPassword, setDisplayPassword] = useState("");
  const [formData, setFormData] = useState({
    in_UserId: "",
    in_password: "",
  });
  const { login } = useAuth();

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/textlogo/5`);
        if (response.data.success) {
          const { ULBLOGO, ABC_MUNICIPAL_TEXT, MARRIAGE_REGISTRATION_TEXT } =
            response.data.data;
          setLogoUrl(ULBLOGO);
          setNavbarText({
            text1: ABC_MUNICIPAL_TEXT,
            text2: MARRIAGE_REGISTRATION_TEXT,
          });
        } else {
          console.error("API response was not successful");
        }
      } catch (error) {
        console.error("Error fetching logo and text:", error);
        // logError(error, "App Component");
        // logErrorToServer(error, "Login - Fetch Logo"); // 🔹 Log the error
      }
    };
    fetchLogo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "in_password") {
      setRealPassword(value);
      setDisplayPassword(value);
    }
  };

  const handleBlur = () => {
    if (realPassword.length > 0) {
      setDisplayPassword("•".repeat(10));
    }
  };

  const handleFocus = () => {
    setDisplayPassword(realPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.in_UserId || !formData.in_password) {
      setError("Username and password are required.");
      return;
    }

    if (!captchaValid) {
      setError("Invalid Captcha. Please try again.");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/Marketlogin`, formData);
      console.log(formData);
      // Debugging: Log the entire API response
      console.log("API Response:", res.data);

      if (res.data?.result?.out_ErrorCode === 0 || res.data.token) {
        console.log("Login Successful! Proceeding...");
        const { token, user } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        login(user, token);

        if (user.otpValidate === "Y") {
          navigate("/HomePage/Dashboard.aspx", { state: { user } });
        } else {
          navigate("/HomePage/Dashboard.aspx");
        }
      } else {
        console.log(
          "Login Failed! Error Code:",
          res.data?.result?.out_ErrorCode
        );
        setError(
          res.data?.result?.Out_ErrorMsg || "Invalid username or password."
        );
      }
    } catch (err) {
      console.error("Login API Error:", err);
      const errorMessage = err.response?.data?.message || "An error occurred";
      setError(errorMessage);
      // logError(err, "Login Component");
    }
  };

  return (
    <div className="login-container">
      <img src={AdminPortal} alt="background" className="background-image" />
      <LoginCard className="card_login">
        <div className="heading-logo">
          {/* <NavbarLogo src={logoUrl} className="logo" /> */}
          <NavbarText text1="Market Department" text2={navbarText.text2} />
        </div>

        <div className="welcome-text">{translate("welcomelogin")}</div>

        <form onSubmit={handleSubmit}>
          <div className="textboxes-container">
            <TextBox
              label={"Username"}
              placeholder={"Enter your username"}
              type="text"
              name="in_UserId"
              value={formData.in_UserId}
              onChange={handleChange}
              required
            />
            <TextBox
              label={"Password"}
              placeholder={"Enter your password"}
              type="password"
              name="in_password"
              value={displayPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              required
            />
          </div>

          <div className="captcha">
            <Captcha onValidate={setCaptchaValid} />
          </div>

          {error && <div className="error-message text-danger">{error}</div>}

          <div className="login-button-container mt-4 mb-3">
            <LoginButton type="submit" className="login-Btn" text="Login" />
          </div>
        </form>
      </LoginCard>
    </div>
  );
};

export default Login;
