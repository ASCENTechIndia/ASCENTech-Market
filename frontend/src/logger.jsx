// import axios from "axios";

// export const logError = async (
//   error,
//   component = "Unknown",
//   user = "Guest",
//   requestUrl = window.location.href
// ) => {
//   try {
//     console.error(`[Error in ${component}]:`, error); // Debugging

//     await axios.post("http://182.70.112.244:5000/log-error", {
//       // Ensure correct backend URL
//       errorMessage: error.message || "Unknown Error",
//       stackTrace: error.stack || "No stack available",
//       component,
//       user,
//       requestUrl,
//     });

//     console.log("✅ Error logged successfully");
//   } catch (err) {
//     console.error("❌ Failed to log error:", err);
//   }
// };

// // ✅ Global Error Handling for Uncaught Errors
// window.onerror = (message, source, lineno, colno, error) => {
//   logError(error || new Error(message), "Global Error Handler");
// };

// // ✅ Global Unhandled Promise Rejection Handling
// window.onunhandledrejection = (event) => {
//   logError(event.reason, "Unhandled Promise Rejection");
// };
