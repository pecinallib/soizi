import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'elevated' | 'outlined' | 'filled';
}

export function Card({
  children,
  className = '',
  variant = 'elevated',
}: CardProps): React.JSX.Element {
  const variants = {
    elevated: 'bg-surface border border-border',
    outlined: 'bg-transparent border-2 border-outline-variant',
    filled: 'bg-surface-container border-none',
  };

  return (
    <div
      className={`rounded-lg p-6 ${variants[variant]} ${className}`}
      style={
        variant === 'elevated' ? { boxShadow: 'var(--shadow-card)' } : undefined
      }
    >
      {children}
    </div>
  );
}
