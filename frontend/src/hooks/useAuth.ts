import { useContext } from 'react';
import { AuthContext } from '@/contexts/auth-context';
import type { AuthContextType } from '@/types';

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
}
