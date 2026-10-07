import React from 'react';
import Link from 'next/link';
import {
  Banknote,
  GraduationCap,
  Shield,
  Building2,
  Route,
  Activity,
  Leaf,
  Briefcase,
  MoreHorizontal,
  ArrowRight,
} from 'lucide-react';

export interface CategoryCardData {
  id: string;
  index: string;
  name: string;
  nameBn: string;
  slug: string;
  description: string;
  reportCount: number;
  iconType:
    | 'corruption'
    | 'education'
    | 'law'
    | 'services'
    | 'infrastructure'
    | 'health'
    | 'environment'
    | 'workplace'
    | 'others';
}

interface CategoryCardProps {
  category: CategoryCardData;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const getCategoryAccent = () => {
    switch (category.iconType) {
      case 'corruption':
        return 'bg-red-50 text-[#C62828] border-red-100 group-hover:border-red-200';
      case 'education':
        return 'bg-blue-50 text-blue-700 border-blue-100 group-hover:border-blue-200';
      case 'law':
        return 'bg-amber-50 text-amber-800 border-amber-100 group-hover:border-amber-200';
      case 'health':
        return 'bg-teal-50 text-teal-700 border-teal-100 group-hover:border-teal-200';
      case 'environment':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 group-hover:border-emerald-200';
      case 'infrastructure':
        return 'bg-orange-50 text-orange-700 border-orange-100 group-hover:border-orange-200';
      case 'workplace':
        return 'bg-violet-50 text-violet-700 border-violet-100 group-hover:border-violet-200';
      case 'services':
        return 'bg-slate-100 text-slate-800 border-slate-200 group-hover:border-slate-300';
      case 'others':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 group-hover:border-slate-300';
    }
  };

  const renderIcon = () => {
    const iconClass = 'w-4 h-4';
    switch (category.iconType) {
      case 'corruption':
        return <Banknote className={iconClass} />;
      case 'education':
        return <GraduationCap className={iconClass} />;
      case 'law':
        return <Shield className={iconClass} />;
      case 'services':
        return <Building2 className={iconClass} />;
      case 'infrastructure':
        return <Route className={iconClass} />;
      case 'health':
        return <Activity className={iconClass} />;
      case 'environment':
        return <Leaf className={iconClass} />;
      case 'workplace':
        return <Briefcase className={iconClass} />;
      case 'others':
      default:
        return <MoreHorizontal className={iconClass} />;
    }
  };

  const getCountLabel = () => {
    if (!category.reportCount || category.reportCount <= 0) {
      return 'No public reports';
    }
    if (category.reportCount === 1) {
      return '1 report';
    }
    return `${category.reportCount} reports`;
  };

  const hasReports = category.reportCount > 0;

  return (
    <Link
      href={`/reports?category=${category.slug}`}
      className="group flex flex-col justify-between p-5 rounded-xl bg-white border border-[#E2E8F0] hover:border-slate-400 hover:shadow-md transition-all text-left"
    >
      <div>
        {/* Top Header: Index & Subtle Color-Accented Icon */}
        <div className="flex items-center justify-between pb-3">
          <span className="font-mono text-xs font-semibold text-slate-400 group-hover:text-[#C62828] transition-colors">
            {category.index}
          </span>
          <div
            className={`w-8 h-8 rounded-md flex items-center justify-center border transition-all ${getCategoryAccent()}`}
          >
            {renderIcon()}
          </div>
        </div>

        {/* Category Title */}
        <h3 className="font-bold text-sm sm:text-base text-[#101828] group-hover:text-[#C62828] transition-colors leading-snug">
          {category.name}
          <span className="block text-[11px] font-normal font-bengali text-slate-500 mt-0.5">
            {category.nameBn}
          </span>
        </h3>

        {/* Short Editorial Description */}
        <p className="text-xs text-[#64748B] leading-relaxed mt-2 line-clamp-2">
          {category.description}
        </p>
      </div>

      {/* Bottom Footer: Report Count and Action Arrow */}
      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span
          className={`font-mono text-[11px] ${
            hasReports ? 'font-bold text-[#101828]' : 'text-slate-400'
          }`}
        >
          {getCountLabel()}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 group-hover:text-[#C62828] group-hover:translate-x-0.5 transition-all">
          <span>Explore</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
