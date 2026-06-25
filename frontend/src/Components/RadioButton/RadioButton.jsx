// Components/RadioButton/RadioButton.jsx
import React from "react";

const RadioButton = ({
  field,
  label,
  value,
  id,
  disabled,
  className,
  ...props
}) => {
  return (
    <label className={`me-3 ${className || ""}`}>
      {" "}
      {/* Added className for better styling */}
      <input
        type="radio"
        id={id} // Use the provided id
        {...field} // Spreads name, onChange, onBlur. Note: field.value is the *group's* value
        value={value} // The specific value of *this* radio option ('Y' or 'N')
        checked={field.value === value} // THIS IS THE CRUCIAL LINE for autofill
        {...props} // Spreads any other props like 'className' passed directly to Field
        disabled={disabled}
      />
      {label}
    </label>
  );
};

export default RadioButton;
