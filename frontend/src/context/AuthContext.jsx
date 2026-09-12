import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("wp_token"));
  const [loading, setLoading] = useState(true);

  // On first load, if we already have a token, ask the backend who it belongs to.
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me(token)
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("wp_token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  function saveSession(newToken, newUser) {
    localStorage.setItem("wp_token", newToken);
    setToken(newToken);
    setUser(newUser);
  }

  async function login(email, password) {
    const data = await api.login(email, password);
    saveSession(data.token, data.user);
  }

  async function signup(fullName, email, password) {
    const data = await api.signup(fullName, email, password);
    saveSession(data.token, data.user);
  }

  async function logout() {
    if (token) await api.logout(token).catch(() => {});
    localStorage.removeItem("wp_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
