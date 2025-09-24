"use client";
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '@/lib/axios';
interface LoginResponse {
  user: User;
}

interface User { _id: string; username: string; email: string; }
interface AuthContextType { user: User | null; login: (userData: LoginResponse) => void; logout: () => void; isLoading: boolean; }
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await api.get('/users/profile');
        setUser(response.data);
      } catch (error) { setUser(null); }
      finally { setIsLoading(false); }
    };
    checkUserStatus();
  }, []);
  const login = (userData: LoginResponse) => { setUser(userData.user); };
  const logout = async () => {
    try {
      await api.post('/users/logout');
      setUser(null);
    } catch (error) { console.error("Logout failed", error); }
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};