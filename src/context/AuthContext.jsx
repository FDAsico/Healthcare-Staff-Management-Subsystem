import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [staffProfile, setStaffProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken") || import.meta.env.VITE_API_TOKEN;
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setStaffProfile(null);
      setLoading(false);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  async function fetchMe() {
    setLoading(true);
    try {
      const res = await api.get("/auth/me");
      const payload = res.data?.data || res.data;
      const meUser = payload?.user || payload?.me || payload?.userData;
      const meStaffProfile = payload?.staffProfile || payload?.profile;

      if (meUser) {
        setUser(meUser);
      }
      if (meStaffProfile) {
        setStaffProfile(meStaffProfile);
      }
    } catch {
      localStorage.removeItem("accessToken");
      setUser(null);
      setStaffProfile(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(username, password) {
    const res = await api.post("/auth/login", { username, password });
    const payload = res.data?.data || res.data;
    const accessToken =
      payload?.accessToken ||
      payload?.token ||
      payload?.access_token ||
      payload?.authToken;
    const loginUser = payload?.user || payload?.me || payload?.userData;
    const loginStaffProfile =
      payload?.staffProfile ||
      payload?.profile ||
      payload?.userProfile;

    if (!accessToken) {
      throw new Error("Invalid login response: missing access token.");
    }

    localStorage.setItem("accessToken", accessToken);

    if (loginUser) {
      setUser(loginUser);
    }
    if (loginStaffProfile) {
      setStaffProfile(loginStaffProfile);
    }

    if (!loginUser) {
      await fetchMe();
    }
  }

  function logout() {
    localStorage.removeItem("accessToken");
    setUser(null);
    setStaffProfile(null);
    navigate("/login", { replace: true });
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