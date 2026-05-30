import React, { useState, useEffect, createContext, useContext } from 'react'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOtp from './pages/VerifyOtp'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import ThreatDetector from './pages/ThreatDetector'
import ThreatHistory from './pages/ThreatHistory'
import Profile from './pages/Profile'

export const AuthContext = createContext(null);

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cybershield_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('cybershield_token') || null);
  const [currentPath, setCurrentPath] = useState('landing');
  const [otpVerifyEmail, setOtpVerifyEmail] = useState('');

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '') || 'landing';
      setCurrentPath(hash);
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Run on mount

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const loginUser = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('cybershield_user', JSON.stringify(userData));
    localStorage.setItem('cybershield_token', userToken);
    window.location.hash = '#/dashboard';
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cybershield_user');
    localStorage.removeItem('cybershield_token');
    window.location.hash = '#/landing';
  };

  // Route guarding
  const publicRoutes = ['landing', 'login', 'register', 'verify-otp', 'forgot-password'];
  
  useEffect(() => {
    const isAuth = !!token;
    if (!isAuth && !publicRoutes.includes(currentPath)) {
      window.location.hash = '#/login';
    } else if (isAuth && (currentPath === 'login' || currentPath === 'register' || currentPath === 'verify-otp' || currentPath === 'forgot-password')) {
      window.location.hash = '#/dashboard';
    }
  }, [currentPath, token]);

  const renderPage = () => {
    switch (currentPath) {
      case 'landing':
        return <Landing />;
      case 'login':
        return <Login />;
      case 'register':
        return <Register />;
      case 'verify-otp':
        return <VerifyOtp />;
      case 'forgot-password':
        return <ForgotPassword />;
      case 'dashboard':
        return <Dashboard />;
      case 'detector':
        return <ThreatDetector />;
      case 'history':
        return <ThreatHistory />;
      case 'profile':
        return <Profile />;
      default:
        return <Landing />;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, otpVerifyEmail, setOtpVerifyEmail, login: loginUser, logout: logoutUser }}>
      <div className="min-h-screen text-cyber-text font-sans">
        {renderPage()}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
