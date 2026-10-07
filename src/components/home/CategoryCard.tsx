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
    const iconClass = "w-4 h-4 sm:w-4.5 sm:h-4.5";
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

  return (
    <Link
      href={`/reports?category=${category.slug}`}
      className="group flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-[10px] bg-white border border-[#E5E7EB] hover:border-[#CBD5E1] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-sm hover:-translate-y-0.5 transition-all text-center"
    >
      {/* Restrained Civic Icon Badge (Monochromatic with subtle crimson hover) */}
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-[#F1F5F9] text-[#334155] group-hover:bg-[#FEE2E2] group-hover:text-[#C62828] flex items-center justify-center mb-2.5 transition-colors">
        {renderIcon()}
      </div>

      <span className="font-semibold text-xs sm:text-[13px] text-[#111827] group-hover:text-[#C62828] transition-colors leading-tight">
        {category.name}
      </span>

      <span className="text-[10px] sm:text-[11px] text-[#6B7280] font-mono mt-0.5">
        {category.reportCount} reports
      </span>
    </Link>
  );
}
