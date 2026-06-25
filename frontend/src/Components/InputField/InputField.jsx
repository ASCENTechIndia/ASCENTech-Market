import React, { useState } from "react";
import { BsChevronDown } from "react-icons/bs";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./InputField.css";
import { inputHandlers } from "../../HOC/Validation/InputValidations"; // Adjust path if needed

const InputField = ({
  field,
  form = {},
  label,
  type = "text",
  options = [],
  placeholder = "",
  styleClass = "",
  readOnly = false,
  disabled = false,
  onChange,
  restrictInput, // 🆕 Add this prop
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { name } = field;
  const value = field.value || "";

  const { errors = {}, touched = {}, setFieldValue } = form;
  const showError = touched[name] && errors[name];

  const handleChange = (e) => {
    if (disabled) return;

    // 🆕 Use custom handler if restrictInput is provided
    if (
      restrictInput &&
      inputHandlers[restrictInput] &&
      typeof inputHandlers[restrictInput] === "function"
    ) {
      inputHandlers[restrictInput](e, setFieldValue, name);
    } else {
      let inputValue = e.target.value;

      // Default phone and Aadhaar logic if no restrictInput is used
      if (type === "tel") {
        inputValue = inputValue.replace(/[^0-9]/g, "");
        if (name === "AAdharNo" || name === "directorAadharCard") {
          inputValue = inputValue.slice(0, 12);
        } else if (name === "MobileNo") {
          inputValue = inputValue.slice(0, 10);
        }
      }

      if (typeof onChange === "function") {
        onChange(e);
      }

      if (typeof setFieldValue === "function") {
        setFieldValue(name, inputValue);
      }
    }
  };

  return (
    <div className={`input-field-wrapper ${styleClass}`}>
      {label && (
        <label className={`input-label ${isFocused ? "focused" : ""}`}>
          {label}
        </label>
      )}

      <div className="input-container">
        {type === "dropdown" ? (
          <>
            <select
              {...field}
              className="input-dropdown form-select"
              value={value || ""}
              onChange={(e) => {
                if (disabled) return;
                const selectedValue = e.target.value;
                if (typeof setFieldValue === "function") {
                  setFieldValue(name, selectedValue);
                }
                if (typeof onChange === "function") {
                  onChange(e);
                }
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={disabled}
            >
              <option value="">{placeholder || "Select an option"}</option>
              {Array.isArray(options) &&
                options.map((option, index) => (
                  <option key={option.value || index} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
            <BsChevronDown className="dropdown-icon" />
          </>
        ) : (
          <>
            <input
              {...field}
              value={value}
              type={
                type === "password"
                  ? showPassword
                    ? "text"
                    : "password"
                  : type
              }
              className={`input-field form-control ${
                showError ? "error-border" : ""
              }`}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              readOnly={readOnly}
              disabled={disabled}
              style={
                readOnly || disabled
                  ? { pointerEvents: "none", backgroundColor: "#f5f5f5" }
                  : {}
              }
            />

            {type === "password" && (
              <span
                className="password-toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InputField;


// import React, { useState } from "react";
// import { BsChevronDown } from "react-icons/bs"; // Dropdown icon
// import { FaEye, FaEyeSlash } from "react-icons/fa"; // Password toggle icons
// import "./InputField.css";

// const InputField = ({
//   field,
//   form = {}, // Ensure form is always an object
//   label,
//   type = "text",
//   options = [],
//   placeholder = "",
//   styleClass = "",
//   readOnly = false,
//   disabled = false,restrictInput,
//   onChange, // Make sure this onChange is passed from Formik or from parent component
// }) => {
//   const [isFocused, setIsFocused] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const { name } = field;
//   const value = field.value || ""; // Use value safely

//   const { errors = {}, touched = {}, setFieldValue } = form; // Ensure errors & touched are objects

//   const showError = touched[name] && errors[name];

//   const handleChange = (e) => {
//     let value = e.target.value; // New line

//       if (typeof restrictInput === "function") {
//       restrictInput(e, form.setFieldValue, name); // assume restrictInput handles setting the value
//     } else if (typeof form.setFieldValue === "function") {
//       setFieldValue(name, value);
//     } else {
//       console.warn("setFieldValue is not defined for field:", name);
//     }
//     let maxLength = undefined;

//     // validations for mobile and adhar numbers
//     if (type === "tel") {
//       value = value.replace(/[^0-9]/g, "");

//       if (name === "AAdharNo" || name === "directorAadharCard") {
//         maxLength = 12; // Aadhaar is 12 digits
//       } else if (name === "MobileNo") {
//         maxLength = 10; // Mobile is 10 digits
//       }

//       if (maxLength !== undefined) {
//         value = value.slice(0, maxLength); // Apply slice if maxLength is set
//       }
//     }

//     if (typeof onChange === "function") {
//       onChange(e);
//     }

//     if (typeof setFieldValue === "function") {
//       setFieldValue(name, value); // ✅ Only call if it's actually a function
//     } else {
//       console.warn("setFieldValue is not defined for field:", name);
//     }
//   };

//   return (
//     <div className={`input-field-wrapper ${styleClass}`}>
//       {label && (
//         <label className={`input-label ${isFocused ? "focused" : ""}`}>
//           {label}
//         </label>
//       )}

//       <div className="input-container">
//         {type === "dropdown" ? (
//           <>
//             <select
//               {...field}
//               className="input-dropdown form-select"
//               value={value || ""}
//               onChange={(e) => {
//                 if (disabled) return;
//                 const selectedValue = e.target.value;
                
//  if (typeof restrictInput === "function") {
//                   restrictInput(e, form.setFieldValue, name);
//                 } else {
//                   setFieldValue(name, selectedValue);
//                 }
//                 if (typeof setFieldValue === "function") {
//                   setFieldValue(name, selectedValue);
//                 }

//                 if (typeof onChange === "function") {
//                   onChange(e);
//                 }
//               }}
//               onFocus={() => setIsFocused(true)}
//               onBlur={() => setIsFocused(false)}
//               disabled={disabled}
//             >
//               <option value="">{placeholder || "Select an option"}</option>
//               {Array.isArray(options) &&
//                 options.map((option, index) => (
//                   <option key={option.value || index} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//             </select>
//             <BsChevronDown className="dropdown-icon" />

//             <BsChevronDown className="dropdown-icon" />
//           </>
//         ) : (
//           <>
//             <input
//               {...field}
//               value={value} // ✅ Bind Formik value properly
//               type={
//                 type === "password"
//                   ? showPassword
//                     ? "text"
//                     : "password"
//                   : type
//               }
//               maxLength={
//                 type === "tel"
//                   ? name === "AAdharNo" || name === "directorAadharCard"
//                     ? 12 // 12 digits for Aadhaar
//                     : 10 // 10 digits for mobile number
//                   : undefined
//               }
//               className={`input-field form-control ${
//                 showError ? "error-border" : ""
//               }`}
//               onChange={handleChange}
//               onFocus={() => setIsFocused(true)}
//               onBlur={() => setIsFocused(false)}
//               placeholder={placeholder}
//               readOnly={readOnly}
//               disabled={disabled}
//               style={
//                 readOnly || disabled
//                   ? { pointerEvents: "none", backgroundColor: "#f5f5f5" }
//                   : {}
//               }
//             />

//             {type === "password" && (
//               <span
//                 className="password-toggle-icon"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? <FaEyeSlash /> : <FaEye />}
//               </span>
//             )}
//           </>
//         )}
//       </div>

//       {/*{showError && <p className="error-message">{errors[name]}</p>} */}
//     </div>
//   );
// };

// export default InputField;
