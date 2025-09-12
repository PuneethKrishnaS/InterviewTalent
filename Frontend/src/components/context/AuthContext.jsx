import { createContext, useContext, useEffect, useState } from "react";
import api from "../../utils/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/api/v1/users/auth/login", {
        email,
        password,
      });
      setUser(res.data?.data);
      setAuthenticated(true);
      setCheckingAuth(false);
      setLoading(false);
      toast.success("User logged in successfully");
      window.location.href = "/dashboard";
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Login failed");
      setError(error.response?.data?.message || error.message);
    }
  };

  const signup = async (credentials) => {
    setLoading(true);
    try {
      const res = await api.post("/api/v1/users/auth/register", credentials);
      setUser(res.data?.data);
      navigate("/login");
      toast.success("User registerd Sucessfully");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Refistration failed");
      setError(error.response?.data?.message || error.message);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post("/api/v1/users/auth/logout");
      setUser(null);
      setAuthenticated(false);
      setCheckingAuth(false);
      setLoading(false);
      toast.success("Logged out sucessfully");
      navigate("/login");
    } catch (error) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  const getUser = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/users/auth/current_user");
      setUser(res.data?.data);
      setAuthenticated(true);
      setCheckingAuth(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setUser(null);
      setAuthenticated(false);
    }
  };

  const values = {
    login,
    signup,
    logout,
    getUser,
    loading,
    user,
    checkingAuth,
    authenticated,
    error,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
