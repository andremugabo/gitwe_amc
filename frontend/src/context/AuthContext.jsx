import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { toast } from '../utils/toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setUser(userInfo);
    }
    setLoading(false);
  }, []);

  // 1 Minute Inactivity Auto-Logout
  useEffect(() => {
    if (!user) return;

    let idleTimeout;

    const resetIdleTimer = () => {
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        logout();
        toast.info('You have been logged out due to inactivity.');
      }, 60000); // 1 minute
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
    events.forEach(event => window.addEventListener(event, resetIdleTimer));
    
    resetIdleTimer(); // start countdown

    return () => {
      clearTimeout(idleTimeout);
      events.forEach(event => window.removeEventListener(event, resetIdleTimer));
    };
  }, [user]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed',
        unverified: error.response?.data?.unverified || false,
        email: email
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
