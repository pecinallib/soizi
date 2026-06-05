interface Requirement {
  label: string;
  met: boolean;
}

function getRequirements(password: string): Requirement[] {
  return [
    { label: '8 caracteres', met: password.length >= 8 },
    { label: 'Letra maiúscula', met: /[A-Z]/.test(password) },
    { label: 'Letra minúscula', met: /[a-z]/.test(password) },
    { label: 'Número', met: /[0-9]/.test(password) },
    { label: 'Símbolo especial', met: /[^A-Za-z0-9]/.test(password) },
  ];
}

function getStrength(metCount: number): { label: string; color: string; bars: number } {
  if (metCount <= 2) return { label: 'Fraca', color: '#ef4444', bars: 1 };
  if (metCount <= 4) return { label: 'Média', color: '#f59e0b', bars: 2 };
  return { label: 'Forte', color: '#00d084', bars: 3 };
}

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps): React.JSX.Element | null {
  if (!password) return null;

  const requirements = getRequirements(password);
  const metCount = requirements.filter((r) => r.met).length;
  const { label, color, bars } = getStrength(metCount);

  return (
    <div className="flex flex-col gap-2 pt-1">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: i <= bars ? color : 'var(--color-border)' }}
            />
          ))}
        </div>
        <span className="text-xs font-semibold w-10 text-right transition-colors" style={{ color }}>
          {label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {requirements.map((req) => (
          <div key={req.label} className="flex items-center gap-1.5">
            <span
              className="text-xs font-bold transition-colors"
              style={{ color: req.met ? '#00d084' : 'var(--color-text-muted)' }}
            >
              {req.met ? '✓' : '✗'}
            </span>
            <span
              className="text-xs transition-colors"
              style={{ color: req.met ? 'var(--color-on-surface)' : 'var(--color-text-muted)' }}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
