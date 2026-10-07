import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-civic-slate-700"
          >
            {label}
            {props.required && <span className="text-alert ml-1">*</span>}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          className={cn(
            'flex min-h-[120px] w-full rounded-md border border-civic-slate-300 bg-white px-3 py-2 text-sm placeholder:text-civic-slate-400 focus:outline-none focus:ring-2 focus:ring-civic-navy focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            error && 'border-alert focus:ring-alert',
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p className="text-xs text-civic-slate-500">{helperText}</p>
        )}
        {error && <p className="text-xs font-medium text-alert">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
