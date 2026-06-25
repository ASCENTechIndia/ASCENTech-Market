// TextBox.js
import React from "react";
import Label from "../Label/Label";
import "./TextBox.css";

const TextBox = ({
  label,

  name,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  type = "text",
  id,
}) => (
  <div className="text-box-container">
    <Label text={label} htmlFor={id} className="text-box-label" />
    <div className="text-box-input-container">
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        className="text-box-input"
      />
    </div>
  </div>
);

export default TextBox;
