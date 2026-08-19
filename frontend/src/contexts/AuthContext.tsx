import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { getCurrentUser, setCurrentUser } from '@/lib/storage';
import { authApi, setAuthToken } from '@/lib/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<User | null>;
  register: (name: string, email: string, password: string) => Promise<User | null>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate the session from localStorage (user + JWT survive refreshes)
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const finishLogin = (loggedIn: User, token: string): User => {
    setAuthToken(token);
    setUser(loggedIn);
    setCurrentUser(loggedIn);
    return loggedIn;
  };

  // Email + password sign-in. The portal (`role`) must match the account's
  // role — an applicant account cannot enter the admin dashboard.
  const login = async (email: string, password: string, role: UserRole): Promise<User | null> => {
    setLoading(true);
    try {
      const { user: loggedIn, token } = await authApi.login(email, password);

      if (loggedIn.role !== role) {
        toast.error(`This account is registered as ${loggedIn.role}, not ${role}.`);
        return null;
      }

      return finishLogin(loggedIn, token);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Applicant self-registration (admins are seeded server-side only)
  const register = async (name: string, email: string, password: string): Promise<User | null> => {
    setLoading(true);
    try {
      const { user: created, token } = await authApi.register(name, email, password);
      return finishLogin(created, token);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentUser(null);
    setAuthToken(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
