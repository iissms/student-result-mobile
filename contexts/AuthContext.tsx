import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthState, User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode'; // 👈 decode JWT

type AuthContextType = {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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
  logout: async () => {},
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const decoded: any = jwtDecode(token);

          const user: User = {
            id: decoded.user_id,
            role: decoded.role,
            collegeId: decoded.college_id,
            token: token,
          };

          setAuthState({
            user,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
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

      const response = await fetch('http://194.238.23.60:5007/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid email or password');
      }

      const data = await response.json();

      const { token } = data;

      await AsyncStorage.setItem('token', token);

      const decoded: any = jwtDecode(token);

      const user: User = {
        id: decoded.user_id,
        role: decoded.role,
        collegeId: decoded.college_id,
        token: token,
      };

      setAuthState({
        user,
        isLoading: false,
        error: null,
      });

    } catch (error) {
      setAuthState({
        user: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to logout:', error);
    }
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
