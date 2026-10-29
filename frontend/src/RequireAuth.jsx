//RequireAuth.jsx
import { useEffect, useState } from 'react';
import { getUserInfo } from './AuthService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "./Context/AuthContext";
export default function RequireAuth({ children, module }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();
   const { user, authChecked } = useAuth();

//  useEffect(() => {
//   (async () => {
//     console.log("🔐 RequireAuth: Checking session for module =", module);
//     const user = await getUserInfo(module);
//     console.log("🔐 /api/me result:", user);

//     if (!user) {
//       const redirectPath = encodeURIComponent(window.location.pathname);
//       navigate(`/?redirect=${redirectPath}`);
//     } else {
//       setAuthenticated(true);
//     }
//     setLoading(false);
//   })();
// }, [module, navigate]);

useEffect(() => {
   let didRedirect = false;
  (async () => {
    console.log("🔐 RequireAuth: Checking session for", module);
    let user = await getUserInfo(module);
    console.log("🔐 /api/me:", user);

    if (!user) {
      // Try refreshing token silently
      try {
        const apiBase = `https://${module}api.nagarkaryavalinew.com`;
        await axios.post(`${apiBase}/api/refresh`, {}, { withCredentials: true });

        user = await getUserInfo(module); // Retry after refresh

        if (user) {
          setAuthenticated(true);
        } else {
          throw new Error("Still unauthorized after refresh");
        }
      } catch (err) {
        console.warn("🔁 Silent refresh failed:", err);
        setTimeout(() => {
            if (!didRedirect) {
              const redirectPath = encodeURIComponent(window.location.pathname);
              navigate(`/?redirect=${redirectPath}`);
              didRedirect = true;
            }
          }, 600); // delay slightly to avoid flashing login screen
        }
      } else {
        setAuthenticated(true);
      }

      setLoading(false);
    })();
  }, [module, navigate]);

  useEffect(() => {
    if (authChecked && !user) {
      const redirectPath = encodeURIComponent(window.location.pathname);
      navigate(`/?redirect=${redirectPath}`);
    }
  }, [authChecked, user, navigate]);

   if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div className="spinner"></div>
      </div>
    );
  }
  return authenticated ? children : null;
}
