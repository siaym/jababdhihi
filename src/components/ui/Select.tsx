import React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  helperText?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, helperText, id, options, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-civic-slate-700"
          >
            {label}
            {props.required && <span className="text-alert ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            aria-invalid={!!error}
            className={cn(
              'flex h-10 w-full appearance-none rounded-md border border-civic-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-civic-navy focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors pr-8',
              error && 'border-alert focus:ring-alert',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-civic-slate-500">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {helperText && !error && (
          <p className="text-xs text-civic-slate-500">{helperText}</p>
        )}
        {error && <p className="text-xs font-medium text-alert">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
