import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [staffProfile, setStaffProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchMe() {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
      setStaffProfile(res.data.staffProfile);
    } catch {
      localStorage.removeItem("accessToken");
    } finally {
      setLoading(false);
    }
  }

  async function login(username, password) {
    const res = await api.post("/auth/login", { username, password });
    const { accessToken, user, staffProfile } = res.data;

    localStorage.setItem("accessToken", accessToken);
    setUser(user);
    setStaffProfile(staffProfile);
  }

  function logout() {
    localStorage.removeItem("accessToken");
    setUser(null);
    setStaffProfile(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, staffProfile, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}