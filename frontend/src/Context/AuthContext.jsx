import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import config from "../utils/config";

const AuthContext = createContext();
let inactivityTimer;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [allowedPaths, setAllowedPaths] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  const startInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      alert("Session expired due to inactivity.");
      logout();
    }, 15 * 60 * 1000); // 15 minutes
  };

  const resetInactivityTimer = () => {
    startInactivityTimer();
  };

  const setupInactivityListeners = () => {
    ["mousemove", "keydown", "click", "scroll"].forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });
  };
  // useEffect(() => {
  //   const token = localStorage.getItem("token");

  //   if (token) {
  //     try {
  //       const decoded = jwtDecode(token);
  //       const isExpired = decoded.exp * 1000 < Date.now(); // exp is in seconds, Date.now() in ms
  //       if (isExpired) {
  //         console.warn("Token expired, logging out.");
  //         logout(); // clear localStorage and set user to null
  //         return;
  //       }
  //       const userData = {
  //         userId: decoded.userId,
  //         username: localStorage.getItem("username"),
  //         deptId: localStorage.getItem("deptid"),
  //         ulbId: localStorage.getItem("ulbId"),
  //         collcenterid: localStorage.getItem("collcenterid"),
  //         lastLogin: localStorage.getItem("lastlogin"),
  //         lastLogout: localStorage.getItem("lastlogout"),
  //         prabhagName: localStorage.getItem("prabhagName"),
  //         prabhagID: localStorage.getItem("prabhagID"), // Fixed key
  //         token,
  //       };

  //       if (
  //         userData.userId &&
  //         userData.username &&
  //         userData.deptId &&
  //         userData.ulbId &&
  //         userData.collcenterid &&
  //         userData.lastLogin &&
  //         userData.lastLogout &&
  //         userData.prabhagName &&
  //         userData.prabhagID
  //       ) {
  //         setUser(userData);
  //       }
  //     } catch (error) {
  //       console.error("Error decoding token:", error);
  //       logout();
  //     }
  //   }
  // }, []);

      const isSSO = new URLSearchParams(
    window.location.search
  ).get("sso") === "true";
    useEffect(() => {
    const checkSession = async () => {

      if (isSSO) {
        console.log("🔥 SSO entry - skipping initial /me");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/me`,
          {
            withCredentials: true
          }
        );

        if (response.data?.user) {
          setUser(response.data.user);
        }

      } catch (error) {
        console.log("ME API ERROR:", error.response?.data);
        setUser(null);

      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

    useEffect(() => {
    const fetchMenus = async () => {
      console.log("🚀 ~ fetchMenus ~ user:", user)
      if (!user) {
        setMenuItems([]);
        setAllowedPaths([]);
        setMenuLoading(false);
        return;
      }

      setMenuLoading(true);
      try {
        debugger;
        const response = await axios.post(
          `${API_BASE_URL}/MarketMenus?userId=${user.userId}&ulbId=${user.ulbId}&deptId=${config.deptId}`
        );
        console.log("🚀 ~ fetchMenus ~ response:", response)
        const allMenus = response.data?.data || [];

        if (!Array.isArray(allMenus)) {
          console.error("API response is not an array:", allMenus);
          setMenuItems([]);
          setAllowedPaths([]);
          return;
        }

        // Clean paths in allMenus first (stripping .aspx and ensuring a leading slash)
        const cleanedMenus = allMenus.map((menu) => {
          if (menu.PAGEPATH) {
            let cleanPath = menu.PAGEPATH.split("?")[0].split("#")[0].replace(/^(\.\.\/|\.\/|~\/|\.\.|~)+/, "").replace(/\.aspx$/i, "").trim();
            if (cleanPath && cleanPath !== "#" && !cleanPath.startsWith("/")) {
              cleanPath = "/" + cleanPath;
            }
            return {
              ...menu,
              PAGEPATH: cleanPath,
            };
          }
          return menu;
        });

        // Set allowed paths using the cleaned menus
        const paths = cleanedMenus
          .map((menu) => menu.PAGEPATH)
          .filter(Boolean);
        setAllowedPaths(paths);

        // Create a menu map for structured hierarchy
        const menuMap = {};
        cleanedMenus.forEach((menu) => {
          menuMap[menu.MENUID] = { ...menu, children: [] };
        });

        // Organize menus into hierarchical structure
        const structuredMenus = [];
        cleanedMenus.forEach((menu) => {
          if (menu.PARENTID === 0) {
            structuredMenus.push(menuMap[menu.MENUID]);
          } else {
            menuMap[menu.PARENTID]?.children.push(menuMap[menu.MENUID]);
          }
        });

        setMenuItems(structuredMenus);
      } catch (error) {
        console.error("Error fetching menus in AuthContext:", error);
        setMenuItems([]);
        setAllowedPaths([]);
      } finally {
        setMenuLoading(false);
      }
    };

    fetchMenus();
  }, [user, API_BASE_URL]);

  const loginAdmin = (userData) => {
    try {
      debugger;
      const userId = userData?.userId;

      // localStorage.setItem("username", userData.Out_UserName);
      // localStorage.setItem("deptid", userData.acccounttype);
      // localStorage.setItem("ulbId", userData.out_OrgId);
      // localStorage.setItem("collcenterid", userData.Out_Collectioncenter);
      // localStorage.setItem("token", token);
      // localStorage.setItem("lastlogin", userData.Out_LastLogin);
      // localStorage.setItem("lastlogout", userData.Out_LastLogOut);
      // localStorage.setItem("prabhagName", userData.prabhagName || "");
      // localStorage.setItem("prabhagID", userData.prabhagID || ""); // Fixed key
      // localStorage.setItem("userId", userData.userId);

      setUser({
        userId,
        username: userData.Out_UserName,
        deptId: userData.deptId,
        ulbId: userData.out_OrgId,
        collcenterid: userData.Out_Collectioncenter,
        lastLogin: userData.Out_LastLogin,
        lastLogout: userData.Out_LastLogOut,
        prabhagName: userData.prabhagName,
        prabhagID: userData.prabhagID, // Fixed key
        // token,
      });
    } catch (error) {
      console.error("Error decoding token during login:", error);
    }
    setupInactivityListeners();
    startInactivityTimer();
  };

  const logout = () => {
    clearTimeout(inactivityTimer);
    localStorage.clear();
    setUser(null);
    sessionStorage.removeItem("isSSOLogin");
    window.location.replace("/"); // force redirect to login
  };

  return (
    <AuthContext.Provider value={{ user,  setUser, loginAdmin, logout, loading, menuItems, allowedPaths, menuLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
