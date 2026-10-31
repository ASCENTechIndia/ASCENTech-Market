

import React from "react";
import { Navigate ,useLocation} from "react-router-dom";
import { useAuth } from "../Context/AuthContext"; // adjust path as needed
import { jwtDecode } from "jwt-decode";
import UnauthorizedView from "../Components/UnauthorizedView/UnauthorizedView";

const ProtectedRoute = ({ children }) => {
  const { user,loading, menuLoading, allowedPaths } = useAuth();
  const location = useLocation();
  
   if (loading || menuLoading) {
    return <div>Loading...</div>;
  }

  const cfcSession = sessionStorage.getItem("cfcSession");

  if (!user || !cfcSession) {
    return <Navigate to="/" replace />;
  }

    const publicProtectedPaths = [
    "/HomePage/Dashboard",
    "/callback",
    "/otp-verification"
  ];

const currentPath = location.pathname + location.search;

  // Helper to normalize full path (e.g., ../Transaction/FrmCollectionList.aspx?mode=2 -> /transaction/frmcollectionlist)
  const normalizeFullPath = (path) => {
    if (!path) return "";
    let p = path.toLowerCase().trim();
    p = p.split("?")[0].split("#")[0]; // Strip query params & hash
    p = p.replace(/^(\.\.\/|\.\/|~\/|\.\.|~)+/, ""); // Strip relative prefixes like ../, ./, ~/
    p = p.replace(/\.aspx$/i, ""); // Strip .aspx extension
    if (!p.startsWith("/")) p = "/" + p;
    if (p.endsWith("/") && p.length > 1) p = p.slice(0, -1);
    return p;
  };

  // Helper to get base module stem of full path (e.g. /transaction/frmapplicationlist -> /transaction/frmapplication)
  const getFullPathStem = (path) => {
    let p = normalizeFullPath(path);
    if (p.endsWith("list") && p.length > 5) {
      p = p.slice(0, -4);
    }
    return p;
  };

  const normCurrent = normalizeFullPath(currentPath);

  const isAllowed =
    publicProtectedPaths.some((p) => {
      const normPublic = normalizeFullPath(p);
      const publicStem = getFullPathStem(p);
      return (
        normCurrent === normPublic ||
        normCurrent.startsWith(publicStem) ||
        normCurrent.endsWith(publicStem)
      );
    }) ||
    allowedPaths.some((p) => {
      const normAllowed = normalizeFullPath(p);
      const allowedStem = getFullPathStem(p);
      return (
        normCurrent === normAllowed ||
        (allowedStem &&
          allowedStem.length > 1 &&
          (normCurrent.startsWith(allowedStem) || normCurrent.endsWith(allowedStem)))
      );
    });

  if (!isAllowed) {
    return <UnauthorizedView />;
  }

    return children;
 
};

export default ProtectedRoute;
