import { useState, useEffect, type ReactNode } from 'react';
import { api } from '@/services/api';
import { AuthContext } from '@/contexts/auth-context';
import type { User, AuthResponse } from '@/types';

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async (): Promise<void> => {
      const token = api.getAccessToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<User>('/auth/me');

        if (response.success && response.data) {
          setUser(response.data);
        } else {
          api.clearTokens();
        }
      } catch {
        api.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });

    if (!response.success || !response.data) {
      throw new Error(response.message);
    }

    api.setTokens(response.data.accessToken, response.data.refreshToken);
    setUser(response.data.user);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<void> => {
    const response = await api.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
    });

    if (!response.success || !response.data) {
      throw new Error(response.message);
    }

    api.setTokens(response.data.accessToken, response.data.refreshToken);
    setUser(response.data.user);
  };

  const logout = (): void => {
    api.clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
