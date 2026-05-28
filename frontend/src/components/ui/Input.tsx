import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helpText, className = '', id, ...props },
    ref,
  ): React.JSX.Element => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-on-surface"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-3 bg-surface border border-border rounded-md text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all duration-200 ${error ? 'border-error ring-1 ring-error' : ''} ${className}`}
          {...props}
        />
        {error && <span className="text-sm text-error">{error}</span>}
        {helpText && !error && (
          <span className="text-sm text-text-muted">{helpText}</span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
