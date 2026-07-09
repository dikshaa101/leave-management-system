import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginApi } from '../api/auth';
import { getProfile } from '../api/employee';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    if (token && username && role) {
      setUser({ token, username, role });
      loadProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [loadProfile]);

  const login = useCallback(async (credentials) => {
    const response = await loginApi(credentials);

    localStorage.setItem('token', response.token);
    localStorage.setItem('username', response.username);
    localStorage.setItem('role', response.role);

    setUser({
      token: response.token,
      username: response.username,
      role: response.role,
    });

    await loadProfile();

    return response;
  }, [loadProfile]);

  const loginWithToken = useCallback(async ({ token, username, role }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);

    setUser({
      token,
      username,
      role,
    });

    await loadProfile();
  }, [loadProfile]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(() => loadProfile(), [loadProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        loginWithToken,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}