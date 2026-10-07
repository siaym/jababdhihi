import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

    const variants = {
      primary:
        'bg-civic-navy text-white hover:bg-civic-navyDark focus-visible:ring-civic-navy shadow-sm',
      secondary:
        'bg-civic-slate-100 text-civic-slate-900 hover:bg-civic-slate-200 focus-visible:ring-civic-slate-400',
      outline:
        'border border-civic-slate-300 bg-transparent text-civic-slate-800 hover:bg-civic-slate-50 focus-visible:ring-civic-navy',
      destructive:
        'bg-alert text-white hover:bg-alert-dark focus-visible:ring-alert shadow-sm',
      ghost:
        'bg-transparent text-civic-slate-700 hover:bg-civic-slate-100 focus-visible:ring-civic-slate-400',
      success:
        'bg-verified text-white hover:bg-verified-dark focus-visible:ring-verified shadow-sm',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
