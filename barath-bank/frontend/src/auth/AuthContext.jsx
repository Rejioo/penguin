// import { createContext, useContext, useEffect, useState } from "react";
// import api from "../services/api";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Restore session on refresh
//   useEffect(() => {
//     const token = localStorage.getItem("accessToken");

//     if (!token) {
//       setLoading(false);
//       return;
//     }

//     api
//       .get("/api/user/me")
//       .then((res) => {
//         setUser(res.data);
//       })
//       .catch(() => {
//         // Token invalid or expired
//         localStorage.removeItem("accessToken");
//         setUser(null);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   const login = ({ accessToken, user }) => {
//     localStorage.setItem("accessToken", accessToken);
//     setUser(user);
//   };

//   const logout = () => {
//     localStorage.removeItem("accessToken");
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         login,
//         logout,
//         isAuthenticated: !!user,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) {
//     throw new Error("useAuth must be used inside AuthProvider");
//   }
//   return ctx;
// }
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on refresh
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/api/user/me")
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = ({ accessToken, user }) => {
    localStorage.setItem("accessToken", accessToken);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
