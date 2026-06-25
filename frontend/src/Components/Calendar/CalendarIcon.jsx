// import React, { useState, useEffect } from "react";
// import ReactDatePicker from "react-datepicker";
// import { format } from "date-fns";
// import "react-datepicker/dist/react-datepicker.css";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "./CalendarIcon.css"; // Assuming you have this CSS file

// const CalendarIcon = ({
//   selectedDate,
//   setSelectedDate,
//   placeholder = "DD/MM/YYYY",
//   disablePastDates = false,
//   isDateLocked = false,
//   autoSelectToday = true,
//   disabled = false,
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const today = new Date();

//   useEffect(() => {
//     // Only auto-select today if selectedDate is truly undefined/null AND autoSelectToday is enabled
//     if (selectedDate === null && autoSelectToday) {
//       // Changed from !selectedDate to selectedDate === null
//       setSelectedDate(today);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedDate, autoSelectToday, setSelectedDate]); // Added dependencies for useEffect

//   const toggleDatePicker = () => {
//     if (!isDateLocked && !disabled) {
//       setIsOpen((prev) => !prev);
//     }
//   };

//   const handleDateChange = (date) => {
//     if (!isDateLocked && !disabled) {
//       setSelectedDate(date);
//       setIsOpen(false);
//     }
//   };

//   return (
//     <div className="textbox-container position-relative d-flex align-items-center">
//       <div className="input-group w-100">
//         <input
//           type="text"
//           className="form-control p-2"
//           placeholder={placeholder}
//           value={
//             selectedDate // Check if selectedDate is not null or undefined
//               ? format(new Date(selectedDate), "dd/MM/yyyy")
//               : ""
//           }
//           readOnly
//           disabled={disabled || isDateLocked}
//           onClick={toggleDatePicker}
//         />

//         <span
//           className={`input-group-text ${isDateLocked ? "disabled" : ""}`}
//           onClick={toggleDatePicker}
//           style={{
//             cursor: disabled || isDateLocked ? "not-allowed" : "pointer",
//           }}
//         >
//           <img
//             src="https://img.icons8.com/ios/50/000000/calendar.png"
//             alt="calendar-icon"
//             style={{
//               width: "20px",
//               height: "20px",
//               opacity: disabled || isDateLocked ? 0.5 : 1,
//             }}
//           />
//         </span>
//       </div>

//       {isOpen && (
//         <div
//           className="datepicker-modal position-absolute bg-white p-2 shadow rounded"
//           style={{ zIndex: 999 }}
//         >
//           <ReactDatePicker
//             selected={selectedDate || today} // Fallback to today if selectedDate is null/undefined
//             onChange={handleDateChange}
//             dateFormat="dd/MM/yyyy"
//             showYearDropdown
//             scrollableYearDropdown
//             yearDropdownItemNumber={100}
//             minDate={disablePastDates ? today : null}
//             maxDate={null}
//             disabled={disabled || isDateLocked}
//             inline
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default CalendarIcon;
import React, { useState, useEffect } from "react";
import ReactDatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CalendarIcon.css"; // Assuming you have this CSS file

const CalendarIcon = ({
  selectedDate,
  setSelectedDate,
  placeholder = "DD/MM/YYYY",
  disablePastDates = false,
  isDateLocked = false,
  autoSelectToday = true,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const today = new Date();

  useEffect(() => {
    // Only auto-select today if selectedDate is truly undefined/null AND autoSelectToday is enabled
    if (selectedDate === null && autoSelectToday) {
      // Changed from !selectedDate to selectedDate === null
      setSelectedDate(today);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, autoSelectToday, setSelectedDate]); // Added dependencies for useEffect

  const toggleDatePicker = () => {
    if (!isDateLocked && !disabled) {
      setIsOpen((prev) => !prev);
    }
  };

  const handleDateChange = (date) => {
    if (!isDateLocked && !disabled) {
      setSelectedDate(date);
      setIsOpen(false);
    }
  };

  return (
    <div className="textbox-container position-relative d-flex align-items-center">
      <div className="input-group w-100">
        <input
          type="text"
          className="form-control p-2"
          placeholder={placeholder}
          value={
            selectedDate // Check if selectedDate is not null or undefined
              ? format(new Date(selectedDate), "dd/MM/yyyy")
              : ""
          }
          readOnly
          disabled={disabled || isDateLocked}
          onClick={toggleDatePicker}
        />

        <span
          className={`input-group-text ${isDateLocked ? "disabled" : ""}`}
          onClick={toggleDatePicker}
          style={{
            cursor: disabled || isDateLocked ? "not-allowed" : "pointer",
          }}
        >
          <img
            src="https://img.icons8.com/ios/50/000000/calendar.png"
            alt="calendar-icon"
            style={{
              width: "20px",
              height: "20px",
              opacity: disabled || isDateLocked ? 0.5 : 1,
            }}
          />
        </span>
      </div>

      {isOpen && (
        <div
          className="datepicker-modal position-absolute bg-white p-2 shadow rounded"
          style={{ zIndex: 999 }}
        >
          <ReactDatePicker
            selected={selectedDate || today} // Fallback to today if selectedDate is null/undefined
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100}
            minDate={disablePastDates ? today : null}
            maxDate={null}
            disabled={disabled || isDateLocked}
            inline
          />
        </div>
      )}
    </div>
  );
};

export default CalendarIcon;
