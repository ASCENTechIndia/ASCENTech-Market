import React from 'react';
import './Time.css'; // Import the CSS file
import { useLanguage } from "../../Context/LanguageProvider";

const TimeComponent = ({ lastLogin, lastLogout }) => {
      const { translate } = useLanguage();
  return (
    <div className="time-component">
      <div className="last-login">{translate("Last Login:")} <span>{lastLogin}</span></div>
      <div className="last-logout">{translate("Last Logout:")} <span>{lastLogout}</span></div>
    </div>
  );
};

export default TimeComponent;
