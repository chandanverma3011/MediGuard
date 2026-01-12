import { useState } from "react";
import { AuthContext } from "./AuthContextDef";

// export const AuthContext = createContext(); // Moved to AuthContextDef.js

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return localStorage.getItem("token") ? { role: "pharmacist" } : null;
  });
  const loading = false;

  const login = (token) => {
    localStorage.setItem("token", token);
    setUser({ role: "pharmacist" });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
