import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userData = {
          userId: decoded.userId,
          username: localStorage.getItem("username"),
          deptId: localStorage.getItem("deptid"),
          ulbId: localStorage.getItem("ulbId"),
          collcenterid: localStorage.getItem("collcenterid"),
          lastLogin: localStorage.getItem("lastlogin"),
          lastLogout: localStorage.getItem("lastlogout"),
          prabhagName: localStorage.getItem("prabhagName"),
          prabhagID: localStorage.getItem("prabhagID"), // Fixed key
          token,
        };

        if (
          userData.userId &&
          userData.username &&
          userData.deptId &&
          userData.ulbId &&
          userData.collcenterid &&
          userData.lastLogin &&
          userData.lastLogout &&
          userData.prabhagName &&
          userData.prabhagID
        ) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const login = (userData, token) => {
    try {
      const decoded = jwtDecode(token);
      const userId = decoded.userId;

      localStorage.setItem("username", userData.Out_UserName);
      localStorage.setItem("deptid", userData.acccounttype);
      localStorage.setItem("ulbId", userData.out_OrgId);
      localStorage.setItem("collcenterid", userData.Out_Collectioncenter);
      localStorage.setItem("token", token);
      localStorage.setItem("lastlogin", userData.Out_LastLogin);
      localStorage.setItem("lastlogout", userData.Out_LastLogOut);
      localStorage.setItem("prabhagName", userData.prabhagName || "");
      localStorage.setItem("prabhagID", userData.prabhagID || ""); // Fixed key
      localStorage.setItem("userId", userData.userId);

      setUser({
        userId,
        username: userData.Out_UserName,
        deptId: userData.acccounttype,
        ulbId: userData.out_OrgId,
        collcenterid: userData.Out_Collectioncenter,
        lastLogin: userData.Out_LastLogin,
        lastLogout: userData.Out_LastLogOut,
        prabhagName: userData.prabhagName,
        prabhagID: userData.prabhagID, // Fixed key
        token,
      });
    } catch (error) {
      console.error("Error decoding token during login:", error);
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
