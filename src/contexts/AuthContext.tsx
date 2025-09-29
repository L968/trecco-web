import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  userId: string | null;
  setUserId: (id: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserIdState] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('trecco_user_id');
    if (storedUserId) {
      setUserIdState(storedUserId);
    }
  }, []);

  const setUserId = (id: string) => {
    setUserIdState(id);
    localStorage.setItem('trecco_user_id', id);
  };

  const logout = () => {
    setUserIdState(null);
    localStorage.removeItem('trecco_user_id');
  };

  return (
    <AuthContext.Provider value={{ userId, setUserId, logout }}>
      {children}
    </AuthContext.Provider>
  );
};