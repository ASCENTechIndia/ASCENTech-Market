// import axios from "axios";
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const logErrorToServer = async (error, componentName = "UnknownComponent") => {
//   try {
//     const user = JSON.parse(localStorage.getItem("user")) || {};
//     const username = user.username || user.email || "Unknown User";

//     await axios.post(`${API_BASE_URL}/log-error`, {
//       errorMessage: error.message,
//       stackTrace: error.stack || "No stack trace",
//       component: componentName,
//       user: username,
//       requestUrl: window.location.href,
//     });
//   } catch (loggingError) {
//     console.error("Failed to log error:", loggingError);
//   }
// };

// export default logErrorToServer;
