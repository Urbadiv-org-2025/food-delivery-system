import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext({
  user: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  isLoading: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const signup = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/register",
        data
      );
      window.location.href = "/"; // Changed from '/app' to '/'
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/login",
        {
          email,
          password,
        }
      );

      // Decode the token to get user role
      const token = response.data.token;
      const tokenPayload = JSON.parse(atob(token.split(".")[1]));

      const userData = {
        ...response.data.user,
        role: tokenPayload.role, // Make sure the role is included
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", tokenPayload.role); // Store role separately if needed
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
