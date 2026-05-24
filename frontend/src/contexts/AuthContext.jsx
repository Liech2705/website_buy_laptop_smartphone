import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../services/authApi';

const AuthContext = createContext(null);

const TOKEN_KEY = 'liechtop_token';
const USER_KEY = 'liechtop_user';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const saveSession = (tokenVal, userVal) => {
    localStorage.setItem(TOKEN_KEY, tokenVal);
    localStorage.setItem(USER_KEY, JSON.stringify(userVal));
    setToken(tokenVal);
    setUser(userVal);
  };

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await authApi.login({ email, password });
      saveSession(res.token, {
        email: res.email,
        fullName: res.fullName,
        role: res.role,
      });
      return { success: true };
    } catch (err) {
      // Trường hợp đặc biệt: email chưa được xác minh
      if (err?.response?.status === 403 && err?.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        return { success: false, emailNotVerified: true, email: err.response.data.email };
      }
      const msg = err?.response?.data?.message || 'Đăng nhập thất bại, vui lòng thử lại.';
      setAuthError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      await authApi.register({ fullName, email, password });
      // Không lưu session — người dùng phải verify email trước
      return { success: true, email };
    } catch (err) {
      const msg = err?.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại.';
      setAuthError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const isAuthenticated = !!token;
  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'owner';

  return (
    <AuthContext.Provider value={{
      token, user, loading, authError,
      isAuthenticated, isAdmin,
      login, register, logout,
      clearError: () => setAuthError(null),
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
