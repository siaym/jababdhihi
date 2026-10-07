import React from 'react';
import { cn } from '@/lib/utils';
import { ReportStatus } from '@/types';
import { STATUS_CONFIG } from '@/config/constants';
import { useI18n } from '@/lib/i18n';
import { CheckCircle2, Clock, Eye, AlertCircle, ArrowUpRight, ShieldCheck, Check } from 'lucide-react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: ReportStatus;
  variant?: 'default' | 'verified' | 'review' | 'alert' | 'neutral';
  icon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  variant = 'default',
  icon = true,
  className,
  children,
  ...props
}) => {
  const { locale } = useI18n();

  if (status && STATUS_CONFIG[status]) {
    const config = STATUS_CONFIG[status];
    const label = locale === 'bn' ? config.label_bn : config.label_en;

    const renderIcon = () => {
      switch (status) {
        case 'verified':
          return <ShieldCheck className="w-3.5 h-3.5 mr-1" />;
        case 'resolved':
          return <Check className="w-3.5 h-3.5 mr-1" />;
        case 'referred':
          return <ArrowUpRight className="w-3.5 h-3.5 mr-1" />;
        case 'under_review':
        case 'evidence_review':
          return <Eye className="w-3.5 h-3.5 mr-1" />;
        case 'more_info_required':
          return <AlertCircle className="w-3.5 h-3.5 mr-1" />;
        case 'submitted':
        case 'received':
        default:
          return <Clock className="w-3.5 h-3.5 mr-1" />;
      }
    };

    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
          config.colorClass,
          className
        )}
        {...props}
      >
        {icon && renderIcon()}
        {children || label}
      </span>
    );
  }

  const variants = {
    default: 'bg-civic-slate-100 text-civic-slate-800 border-civic-slate-200',
    verified: 'bg-verified-light text-verified-dark border-verified/30',
    review: 'bg-review-light text-review-dark border-review/30',
    alert: 'bg-alert-light text-alert-dark border-alert/30',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
