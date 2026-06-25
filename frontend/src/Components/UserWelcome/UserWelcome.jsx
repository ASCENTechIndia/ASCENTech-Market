import React from "react";
//import { useLanguage } from "../../Context/LanguageProvider";

const UserWelcome = ({ username }) => {
  // const { translate } = useLanguage();
  return (
    <div className="d-flex justify-content-center justify-content-lg-end p-1">
      <span className="fw-bold text-muted">
        {"Welcome"}, {username}
      </span>
    </div>
  );
};

export default UserWelcome;
