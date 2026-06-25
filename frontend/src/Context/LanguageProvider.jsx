import { createContext, useContext, useState, useEffect } from "react";
import translations from "../Translations/translation.json";

export const LanguageContext = createContext();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en"); // Default language
  const [loading, setLoading] = useState(true); // ✅ Fix added here

  // useEffect(() => {
  //   const fetchLanguage = async () => {
  //     try {
  //       console.log("Fetching language...");

  //       const response = await fetch(`${API_BASE_URL}/api/language`, {
  //         method: "GET",
  //         credentials: "include",
  //         headers: {
  //           "Cache-Control": "no-cache",
  //           Pragma: "no-cache",
  //           Expires: "0",
  //           "Content-Type": "application/json",
  //         },
  //       });

  //       console.log("Response received:", response);

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! Status: ${response.status}`);
  //       }

  //       const data = await response.json();
  //       console.log("Fetched language:", data);

  //       if (data.language) {
  //         setLanguage(data.language);
  //       }
  //     } catch (error) {
  //       console.error("⚠️ Error fetching language:", error);
  //     } finally {
  //       setLoading(false); // ✅ No more undefined error
  //     }
  //   };

  //   fetchLanguage();
  // }, []);

  const translate = (key) => translations[language]?.[key] || key;

  return (
    <LanguageContext.Provider value={{ translate, language, loading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

// import React, { createContext, useContext, useState } from "react";
// import en from "../Translations/en.json";
// import mr from "../Translations/mr.json";

// const LanguageContext = createContext();

// export const LanguageProvider = ({ children }) => {
//   const [language, setLanguage] = useState("en");
//   const translations = { en, mr };

//   const translate = (key) => translations[language][key] || key;

//   const switchLanguage = (lang) => {
//     setLanguage(lang);
//     localStorage.setItem("language", lang); // Save selected language
//   };

//   return (
//     <LanguageContext.Provider value={{ translate, switchLanguage, language }}>
//       {children}
//     </LanguageContext.Provider>
//   );
// };

// export const useLanguage = () => useContext(LanguageContext);
