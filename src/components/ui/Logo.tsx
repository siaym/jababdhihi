import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  showWordmark?: boolean;
}

export function Logo({
  className,
  size = 'md',
  href = '/',
  showWordmark = true,
}: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const subTextSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  const content = (
    <div className={cn('flex items-center gap-2.5 group select-none', className)}>
      {/* Custom Jababdihi Civic Accountability Emblem */}
      <svg
        className={cn('shrink-0 transition-transform group-hover:scale-105', iconSizes[size])}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Jababdihi Emblem"
      >
        {/* Red Sun / Watch / Focus Disk */}
        <circle cx="24" cy="18" r="13" fill="#C62828" />

        {/* Civic Architectural / Smriti Soudho Monument Silhouette Pillars */}
        <rect x="7" y="32" width="3.5" height="12" rx="1.5" fill="#111827" />
        <rect x="12" y="27" width="3.5" height="17" rx="1.5" fill="#111827" />
        <rect x="17" y="21" width="3.5" height="23" rx="1.5" fill="#111827" />
        
        {/* Central Apex Monument Pillar */}
        <path
          d="M22 13C22 11.8954 22.8954 11 24 11C25.1046 11 26 11.8954 26 13V44H22V13Z"
          fill="#111827"
        />

        <rect x="27.5" y="21" width="3.5" height="23" rx="1.5" fill="#111827" />
        <rect x="32.5" y="27" width="3.5" height="17" rx="1.5" fill="#111827" />
        <rect x="37.5" y="32" width="3.5" height="12" rx="1.5" fill="#111827" />

        {/* Foundation Civic Horizon Baseline */}
        <path d="M5 43.5H43" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col justify-center leading-none">
          <span
            className={cn(
              'font-extrabold tracking-tight text-[#111827] group-hover:text-[#C62828] transition-colors',
              textSizes[size]
            )}
          >
            Jababdihi
          </span>
          <span
            className={cn(
              'font-semibold text-[#111827]/80 tracking-normal mt-0.5 font-bengali',
              subTextSizes[size]
            )}
          >
            জবাবদিহি
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
