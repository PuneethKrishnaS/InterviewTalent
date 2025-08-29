import { createContext, useContext, useEffect, useState } from "react";
import api from "../../utils/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const login = async (email, password) => {
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
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
      setError(error);
    }
  };

  const signup = async (credentials) => {
    try {
      const res = await api.post("/api/v1/users/auth/register", credentials);
      setUser(res.data?.data);
      setLoading(false);
      navigate("/login");
      toast.success("User registerd Sucessfully");
    } catch (error) {
      console.error(error);
    }
  };

  const logout = async () => {
    try {
      const res = await api.post("/api/v1/users/auth/logout");
      setUser(null);
      setAuthenticated(false);
      setCheckingAuth(false);
      setLoading(true);
      toast.success("Logged out sucessfully");
      navigate("/login");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getUser = async () => {
    try {
      const res = await api.post("/api/v1/users/auth/current_user");
      setUser(res.data?.data);
      setAuthenticated(true);
      setCheckingAuth(false);
      setLoading(false);
    } catch (error) {
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
