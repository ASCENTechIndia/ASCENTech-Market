import React, { useState, useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

import "./OTP.css";

const OTPVerification = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60); // 1-minute countdown
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isVerifyDisabled, setIsVerifyDisabled] = useState(false);

  // Function to generate OTP (for demonstration)
  const generateOtp = () => {
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("Generated OTP:", newOtp);
    setOtp(["", "", "", ""]); // Clear input fields
    setTimer(60); // Reset 1-minute timer
    setIsResendDisabled(true);
    setIsVerifyDisabled(false);
  };

  // Countdown timer effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsResendDisabled(false); // Allow resend OTP
      setIsVerifyDisabled(true); // Disable verify button
    }
  }, [timer]);

  // Handle OTP input change
  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to the next input field automatically when a digit is entered
    if (value !== "" && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }

    // Move to the previous input field automatically when a digit is erased
    if (value === "" && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  // Handle OTP verification
  const handleVerify = () => {
    const enteredOtp = otp.join("");
    console.log("Entered OTP:", enteredOtp);
    alert(`Entered OTP: ${enteredOtp}`);
  };

  return (
    <div className="otp-container">
      <div className="otp-box">
        <div className="head">
          <h2>OTP Verification!</h2>
        </div>
        <h3>Enter OTP Code</h3>
        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
            />
          ))}
        </div>
        <button
          className="verify-btn"
          onClick={handleVerify}
          disabled={isVerifyDisabled}
        >
          Verify OTP
        </button>

        <div className="timer-container">
          <p className="timer-text">
            {isResendDisabled
              ? `Resend OTP in ${timer}s`
              : "Didn't receive OTP?"}
          </p>
          <button
            className="resend-btn"
            onClick={generateOtp}
            disabled={isResendDisabled}
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
