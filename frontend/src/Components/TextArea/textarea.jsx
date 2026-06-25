import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./textarea.css"; // Import your CSS file

const TextArea = ({
  field,
  form,
  label,
  placeholder,
  rows = 5,
  cols = 60,
  disabled,
}) => {
  return (
    <div className="textarea-container mb-3">
      {label && <label className="textarea-label">{label}</label>}
      <textarea
        className="textarea-input form-control"
        placeholder={placeholder}
        {...field} // ✅ Pass Formik's field props
        rows={rows}
        cols={cols}
        disabled={disabled}
      />
    </div>
  );
};

export default TextArea;
