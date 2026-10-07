'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { useI18n, Locale } from '@/lib/i18n';
import {
  Search,
  Globe,
  ChevronDown,
  Menu,
  X,
  FileText,
} from 'lucide-react';

export function Header() {
  const { locale, setLocale } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/reports', label: 'Reports' },
    { href: '/map', label: 'Map' },
    { href: '/#categories', label: 'Categories' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/methodology', label: 'About' },
  ];

  const handleLanguageSelect = (newLoc: Locale) => {
    setLocale(newLoc);
    setLangDropdownOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      window.location.href = `/reports?searchQuery=${encodeURIComponent(navSearchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full h-[74px] bg-white border-b border-[#E5E7EB]">
      <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* 1. LOGO ON THE FAR LEFT */}
        <div className="shrink-0">
          <Logo size="md" href="/" />
        </div>

        {/* 2. NAVIGATION IN THE CENTER (DESKTOP) */}
        <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-[15px] font-medium text-[#111827]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`transition-colors hover:text-[#C62828] ${
                  isActive ? 'text-[#C62828] font-semibold' : 'text-[#374151]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* 3. SEARCH & CONTROLS ON THE RIGHT */}
        <div className="hidden md:flex items-center gap-3.5 xl:gap-4 shrink-0">
          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-56 lg:w-64 xl:w-72">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={navSearchQuery}
              onChange={(e) => setNavSearchQuery(e.target.value)}
              placeholder="Search reports, locations, keywords..."
              className="w-full h-9 pl-9 pr-3 rounded-md bg-[#F3F4F6] text-xs text-[#111827] placeholder:text-[#6B7280] border border-transparent focus:bg-white focus:border-[#D1D5DB] focus:outline-none transition-all"
            />
          </form>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#374151] hover:text-[#111827] rounded-md transition-colors"
            >
              <Globe className="w-4 h-4 text-[#6B7280]" />
              <span>{locale === 'bn' ? 'বাংলা' : 'EN'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-28 bg-white border border-[#E5E7EB] rounded-md shadow-lg py-1 z-50 text-xs">
                <button
                  type="button"
                  onClick={() => handleLanguageSelect('en')}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F4F6] transition-colors ${
                    locale === 'en' ? 'font-bold text-[#C62828]' : 'text-[#374151]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageSelect('bn')}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F4F6] transition-colors ${
                    locale === 'bn' ? 'font-bold text-[#C62828]' : 'text-[#374151]'
                  }`}
                >
                  বাংলা
                </button>
              </div>
            )}
          </div>

          {/* Log In Link */}
          <Link
            href="/admin"
            className="text-xs font-semibold text-[#374151] hover:text-[#111827] px-2 py-1.5 transition-colors"
          >
            Log In
          </Link>

          {/* Red Submit Report Button */}
          <Link href="/report">
            <button
              type="button"
              className="h-10 px-4 rounded-md bg-[#C62828] hover:bg-[#B71C1C] active:bg-[#991B1B] text-white text-xs font-bold tracking-tight shadow-sm transition-colors whitespace-nowrap"
            >
              Submit Report
            </button>
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/report">
            <button
              type="button"
              className="h-8 px-3 rounded-md bg-[#C62828] text-white text-xs font-bold whitespace-nowrap"
            >
              Report
            </button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#374151] hover:text-[#111827]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 py-4 space-y-3 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={navSearchQuery}
              onChange={(e) => setNavSearchQuery(e.target.value)}
              placeholder="Search reports, locations, keywords..."
              className="w-full h-9 pl-9 pr-3 rounded-md bg-[#F3F4F6] text-xs"
            />
          </form>

          <div className="flex flex-col space-y-2 pt-2 border-t border-[#E5E7EB]">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-sm font-medium text-[#374151] hover:text-[#C62828]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
            <button
              onClick={() => handleLanguageSelect(locale === 'bn' ? 'en' : 'bn')}
              className="font-medium text-[#C62828]"
            >
              {locale === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
            </button>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="font-semibold text-[#111827]"
            >
              Log In (Reviewer Portal)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
