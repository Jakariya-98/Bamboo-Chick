import { createContext, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // On first load, if a token is saved, ask the server who we are.
  useEffect(() => {
    if (!tokenStore.get()) { setReady(true); return; }
    api.me()
      .then((d) => setUser(d.user))
      .catch(() => tokenStore.clear())
      .finally(() => setReady(true));
  }, []);

  const handleAuth = ({ token, user: u }) => {
    tokenStore.set(token);
    setUser(u);
    return u;
  };

  const value = {
    user,
    ready,
    login: async (email, password) => handleAuth(await api.login(email, password)),
    register: async (data) => handleAuth(await api.register(data)),
    logout: () => { tokenStore.clear(); setUser(null); }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
