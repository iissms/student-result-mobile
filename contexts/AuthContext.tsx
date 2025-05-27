import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthState, User } from '@/types';
import { mockUsers } from '@/utils/mockData';

type AuthContextType = {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
};

export const AuthContext = createContext<AuthContextType>({
  authState: initialState,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  
  useEffect(() => {
    // Check if user is already logged in (e.g., from AsyncStorage)
    const checkAuth = async () => {
      try {
        // In a real app, we would check for tokens in AsyncStorage
        // For demo, set isLoading to false after a delay
        setTimeout(() => {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }, 1000);
      } catch (error) {
        setAuthState({
          user: null,
          isLoading: false,
          error: 'Failed to restore authentication state',
        });
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }));
      
      // Mock authentication - in a real app, this would be an API call
      const user = mockUsers.find(u => u.email === email);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAuthState({
        user,
        isLoading: false,
        error: null,
      });
      
      // In a real app, save tokens to AsyncStorage
      
    } catch (error) {
      setAuthState({
        user: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };
  
  const logout = () => {
    // In a real app, clear tokens from AsyncStorage
    setAuthState({
      user: null,
      isLoading: false,
      error: null,
    });
  };
  
  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        logout,
        isAuthenticated: !!authState.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);