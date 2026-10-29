import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import Fire from "../../assets/bg.png";
import TextBox from "../../Components/TextBox/TextBox";
import "./login.css";
import LoginCard from "../../Components/Card/LoginCard";
import LoginButton from "../../Components/Buttons/button";
import NavbarText from "../../Components/NavbarText/NavbarText";
import NavbarLogo from "../../Components/NavbarLogo/NavbarLogo";
import Captcha from "../Captcha/Captcha";
import { useLanguage } from "../../Context/LanguageProvider";
// import { logError } from "../../logger"; // 🔹 Import the error logger
import { useAuth } from "../../Context/AuthContext";
// import { login } from "../../AuthService";
import apiService from "../../../apiService";

// const Login = () => {
const Login = ({module}) => {
  const [captchaValid, setCaptchaValid] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { translate } = useLanguage();
  const [logoUrl, setLogoUrl] = useState("");
  const [error, setError] = useState(null);
  const [navbarText, setNavbarText] = useState({ text1: "", text2: "" });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [realPassword, setRealPassword] = useState("");
  const [displayPassword, setDisplayPassword] = useState("");
  const [formData, setFormData] = useState({
    in_UserId: "",
    in_password: "",
  });
  const { loginAdmin } = useAuth();

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await apiService.get(`textlogo/5`);
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

  // normal login
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError(null);

  //   if (!formData.in_UserId || !formData.in_password) {
  //     setError("Username and password are required.");
  //     return;
  //   }

  //   if (!captchaValid) {
  //     setError("Invalid Captcha. Please try again.");
  //     return;
  //   }

  //   try {
  //     const res = await apiService.post(`login`, formData);
  //     console.log(formData);
  //     // Debugging: Log the entire API response
  //     console.log("API Response:", res.data);

  //     if (res.data?.result?.out_ErrorCode === 0 || res.data.token) {
  //       console.log("Login Successful! Proceeding...");
  //       const { token, user } = res.data;
  //       localStorage.setItem("token", token);
  //       localStorage.setItem("user", JSON.stringify(user));

  //       // login(user, token);
  //        loginAdmin(user, token);

  //       if (user.otpValidate === "Y") {
  //         navigate("/HomePage/Dashboard", { state: { user } });
  //       } else {
  //         navigate("/HomePage/Dashboard");
  //       }
  //     } else {
  //       console.log(
  //         "Login Failed! Error Code:",
  //         res.data?.result?.out_ErrorCode
  //       );
  //       setError(
  //         res.data?.result?.Out_ErrorMsg || "Invalid username or password."
  //       );
  //     }
  //   } catch (err) {
  //     console.error("Login API Error:", err);
  //     const fallbackMessage = err?.message?.includes("salt")
  //       ? "Invalid username or password." // crypto decryption failed
  //       : err?.response?.data?.message || err.message || "An error occurred";

  //     setError(fallbackMessage);
  //     // logError(err, "Login Component");
  //   }
  // };

// SSO login
//   const handleSubmit = async (e) => {
//   e.preventDefault();
//   setError(null);

//   if (!formData.in_UserId || !formData.in_password) {
//     setError("Username and password are required.");
//     return;
//   }

//   if (!captchaValid) {
//     setError("Invalid Captcha. Please try again.");
//     return;
//   }

//   setLoading(true);
//   try {
//     const loginResponse = await login(formData.in_UserId, formData.in_password, module);

//     if (loginResponse?.user) {
//       const loggedInUser = loginResponse.user;
//       localStorage.setItem("user", JSON.stringify(loggedInUser));
//       loginAdmin(loggedInUser, loginResponse.token);

//       const redirectParam = new URLSearchParams(window.location.search).get('redirect');
//       const redirectPath = redirectParam || '/HomePage/Dashboard';

//       if (loggedInUser.otpValidate === "Y") {
//         navigate(redirectPath, { state: { user: loggedInUser } });
//       } else {
//         navigate("/HomePage/Dashboard");
//       }
//     }
//   } catch (error) {
//     let errorMsg = "Invalid username or password.";

//     // Axios response error check
//     const rawError = error?.response?.data?.details?.error_description;
//     if (rawError) {
//       try {
//         const match = rawError.match(/{.*}/);
//         if (match) {
//           const parsed = JSON.parse(match[0]);
//           errorMsg = parsed?.message || errorMsg;
//         }
//       } catch (e) {
//         console.warn("Failed to parse error_description:", e);
//       }
//     }

//     console.log("Login Failed!", error);
//     setError(errorMsg);
//   } finally {
//     setLoading(false);
//   }
// };

// const handleSilentSubmit = async (userid, password) => {
//   // debugger;
//   try {
//     setLoading(true);
//     const loginResponse = await login(userid, password, module); 
//      const loggedInUser = loginResponse.user;
//       localStorage.setItem("user", JSON.stringify(loggedInUser));
//       loginAdmin(loggedInUser, loginResponse.token);
//     navigate("/HomePage/Dashboard");
//   } catch (err) {
//     setError("Silent login failed. Please login manually.");
//     setLoading(false);
//   }
// };

//without sso
const loginUser = async (userid, password) => {
  const res = await axios.post(`${API_BASE_URL}/login`, {
    in_UserId: userid,
    in_password: password,
  },{
      withCredentials: true,
    });

  if (!res?.data || typeof res.data !== "object") {
    throw new Error("Invalid response");
  }

  // if (res.data?.result?.out_ErrorCode === 0 || res.data.token) {
  //   return res.data;
  // } else {
  //   throw new Error(
  //     res.data?.result?.Out_ErrorMsg || "Invalid username or password."
  //   );
  // }
   if (res.data?.user?.errorCode === 9999) {
    // console.log("✅ Fire login successful");
    return res.data;
  }

  throw new Error(
    res.data?.user?.errorMsg || "Invalid username or password."
  );
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
    const data = await loginUser(formData.in_UserId, formData.in_password);

    const {  user } = data;

    // localStorage.setItem("token", token);
    // localStorage.setItem("user", JSON.stringify(user));

    loginAdmin(user);
    sessionStorage.setItem("cfcSession", "true");
    if (user.otpValidate === "Y") {
      navigate("/otp-verification", {
        state: {
          userId: user.userId,
          mobile: user.mobileNo,
          ulbId: user.out_OrgId,
          maskedMobile: user.mobileNo?.replace(/^(\d{2})\d{6}(\d{2})$/, "$1******$2"),
        },
      });
    } else {
      navigate("/HomePage/Dashboard");
    }

  } catch (err) {
    setError(err.message);
  }
};

const handleSilentSubmit = async (userid, password) => {
  try {
    setLoading(true);

    const data = await loginUser(userid, password);

    const {  user } = data;

    // localStorage.setItem("token", token);
    // localStorage.setItem("user", JSON.stringify(user));

    loginAdmin(user);
     sessionStorage.setItem("cfcSession", "true");

      window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );
      navigate("/HomePage/Dashboard");
    // }

  } catch (err) {
      console.error("❌ SILENT LOGIN ERROR:", err);
    console.error("❌ response:", err.response?.data);

    setError(err.message || "Silent login failed.");
  } finally {
    setLoading(false);
  }
};

const validateTokenAndLogin = async () => {
  // debugger;
  try {
    const response = await axios.post(`${API_BASE_URL}/validate-token`, {}, { withCredentials: true });
    const outBinds = response.data?.outBinds;
    console.log("🔥 validate response", outBinds);

    if (outBinds?.out_ErrorCode === 9999) {
      console.log("✅ Valid token, logging in silently...");
      await handleSilentSubmit(outBinds.out_userid, outBinds.out_encpassword);
      return true;
    } else {
      console.log("❌ Invalid token, redirect needed");
      return false;
    }
  } catch (err) {
    console.error("❌ API call failed:", err);
  // 🔍 Full Axios error breakdown
  // console.error("📂 Full error object:", err);
    return false;
  }
};

useEffect(() => {
  const checkSession = async () => {
    const ok = await validateTokenAndLogin();
    if (!ok) {
      window.location.href = "https://nagarkaryavalinewuat.com/";
    }
  };
  checkSession();
}, []);

  return (
     <>
  {loading ? (
    // Show fullscreen loader
    <div className="flex justify-center items-center h-screen bg-white">
  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50"></div>
</div>
  ) : (
    <div className="login-container">
      <img src={Fire} alt="background" className="background-image" />
      <LoginCard className="card_login">
        <div className="heading-logo">
          {/* <NavbarLogo src={logoUrl} className="logo" /> */}
          <NavbarText
            text1="CFC Department"
            text2={navbarText.text2}
            className="navbar-text1"
          />
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
     )}
    </>
  );
};

export default Login;
