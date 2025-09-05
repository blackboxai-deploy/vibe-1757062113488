'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (passcode: string) => boolean;
  logout: () => void;
  language: 'en' | 'fr';
  setLanguage: (lang: 'en' | 'fr') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [language, setLanguage] = useState<'en' | 'fr'>('en');

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('edu_ai_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }

    // Load saved language preference
    const savedLanguage = localStorage.getItem('edu_ai_language') as 'en' | 'fr';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const login = (passcode: string): boolean => {
    if (passcode === '422025') {
      setIsAuthenticated(true);
      localStorage.setItem('edu_ai_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('edu_ai_auth');
  };

  const updateLanguage = (lang: 'en' | 'fr') => {
    setLanguage(lang);
    localStorage.setItem('edu_ai_language', lang);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        login, 
        logout, 
        language, 
        setLanguage: updateLanguage 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};