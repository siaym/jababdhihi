import React from 'react';
import Link from 'next/link';
import {
  Banknote,
  GraduationCap,
  Shield,
  Building2,
  Route,
  Cross,
  Leaf,
  Briefcase,
  MoreHorizontal,
} from 'lucide-react';

export interface CategoryCardData {
  id: string;
  name: string;
  slug: string;
  reportCount: string;
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
  const renderIcon = () => {
    switch (category.iconType) {
      case 'corruption':
        return (
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Banknote className="w-5 h-5" />
          </div>
        );
      case 'education':
        return (
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
            <GraduationCap className="w-5 h-5" />
          </div>
        );
      case 'law':
        return (
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-[#C62828]">
            <Shield className="w-5 h-5" />
          </div>
        );
      case 'services':
        return (
          <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-700">
            <Building2 className="w-5 h-5" />
          </div>
        );
      case 'infrastructure':
        return (
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Route className="w-5 h-5" />
          </div>
        );
      case 'health':
        return (
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <div className="w-5 h-5 flex items-center justify-center font-bold text-lg leading-none">+</div>
          </div>
        );
      case 'environment':
        return (
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Leaf className="w-5 h-5" />
          </div>
        );
      case 'workplace':
        return (
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Briefcase className="w-5 h-5" />
          </div>
        );
      case 'others':
      default:
        return (
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
            <MoreHorizontal className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <Link
      href={`/reports?category=${category.slug}`}
      className="group flex flex-col items-center justify-center p-4 sm:p-5 rounded-[12px] bg-white border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-[#D1D5DB] hover:-translate-y-0.5 transition-all text-center min-w-[130px] sm:min-w-[145px]"
    >
      <div className="mb-3 transition-transform group-hover:scale-105">
        {renderIcon()}
      </div>

      <span className="font-bold text-[13px] sm:text-sm text-[#111827] group-hover:text-[#C62828] transition-colors leading-tight">
        {category.name}
      </span>

      <span className="text-[11px] text-[#6B7280] font-normal mt-1">
        {category.reportCount} reports
      </span>
    </Link>
  );
}
