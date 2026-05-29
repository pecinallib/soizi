import { useState } from 'react';
import type { Explanation } from '@/types';

interface ExplanationTriggerProps {
  explanation:
    | Explanation
    | { title: string; description: string; example?: string | null };
}

export function ExplanationTrigger({
  explanation,
}: ExplanationTriggerProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-bold text-tertiary bg-tertiary/10 rounded-full hover:bg-tertiary/20 transition-colors duration-200 cursor-pointer"
        aria-label={`O que é ${explanation.title}?`}
      >
        ?
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 left-0 top-8 w-80 bg-surface border border-border rounded-lg shadow-lg p-4 animate-fade-in">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-heading text-base font-bold text-on-surface">
                {explanation.title}
              </h4>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-text-muted hover:text-on-surface transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {explanation.description}
            </p>
            {explanation.example && (
              <div className="mt-3 p-3 bg-primary-container/10 rounded-md">
                <p className="text-sm text-on-surface">
                  <span className="font-semibold">Exemplo: </span>
                  {explanation.example}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </span>
  );
}
