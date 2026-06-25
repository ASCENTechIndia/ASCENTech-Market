import React from "react";
import "./Text-box.css";

const Textbox = ({
  type = "text",
  options = [],
  placeholder = "",
  value,
  onChange,
}) => {
  return (
    <div className="textbox-container">
      {type === "select" ? (
        <select className="textbox" value={value} onChange={onChange}>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className="textbox"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
};

export default Textbox;
