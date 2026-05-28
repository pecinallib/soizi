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
    elevated: 'bg-surface border border-border shadow-sm',
    outlined: 'bg-transparent border-2 border-outline-variant',
    filled: 'bg-surface-container border-none',
  };

  return (
    <div className={`rounded-lg p-6 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}
