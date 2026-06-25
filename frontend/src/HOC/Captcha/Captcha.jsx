import React, { useState, useEffect } from "react";
import "./Captcha.css";
//import { useLanguage } from "../../Context/LanguageProvider";

import "@fortawesome/fontawesome-free/css/all.min.css";

const Captcha = ({ onValidate }) => {
  // const { translate } = useLanguage();

  const [captcha, setCaptcha] = useState(""); // Stores the generated captcha
  const [userInput, setUserInput] = useState(""); // Stores user input

  // Function to generate a new captcha
  const generateCaptcha = () => {
    const randomString = Math.random().toString(36).substring(2, 7);
    const captchaText = randomString
      .split("")
      .map((char) => (Math.random() > 0.5 ? char.toUpperCase() : char))
      .join("");

    setCaptcha(captchaText);
    setUserInput(""); // Reset user input
  };

  // Validate the user's input when it changes
  useEffect(() => {
    if (onValidate) {
      onValidate(userInput === captcha); // Returns true if valid, false otherwise
    }
  }, [userInput, captcha, onValidate]);

  // Generate Captcha on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  return (
    <div className="captcha-container">
      <label className="text-box-label">{`${"Enter Captcha"} :`}</label>
      <div className="captcha_box">
        <div className="captcha-display">
          {captcha.split("").map((char, index) => (
            <span key={index}>{char}</span>
          ))}
        </div>{" "}
        <button
          type="button"
          className="refresh_button"
          onClick={generateCaptcha}
        >
          <i className="fa-solid fa-rotate-right"></i>
        </button>
        <input
          type="text"
          className="captcha-input"
          placeholder={"Enter Captcha"}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Captcha;
