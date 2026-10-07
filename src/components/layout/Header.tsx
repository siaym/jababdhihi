'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n, Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import {
  Shield,
  Menu,
  X,
  Languages,
  PlusCircle,
  Search,
  MapPin,
  BarChart3,
  Building,
  HelpCircle,
  Lock,
} from 'lucide-react';

export function Header() {
  const { locale, setLocale, t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/reports', label: t('nav.reports'), icon: Search },
    { href: '/map', label: t('nav.map'), icon: MapPin },
    { href: '/dashboard', label: t('nav.dashboard'), icon: BarChart3 },
    { href: '/organizations', label: t('nav.organizations'), icon: Building },
    { href: '/resources', label: t('nav.resources'), icon: HelpCircle },
    { href: '/how-it-works', label: t('nav.howItWorks'), icon: HelpCircle },
  ];

  const toggleLanguage = () => {
    const next: Locale = locale === 'bn' ? 'en' : 'bn';
    setLocale(next);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-civic-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-lg bg-civic-navy text-white flex items-center justify-center shadow-sm group-hover:bg-civic-navyDark transition-colors">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-base md:text-lg leading-tight text-civic-navy">
                {t('nav.title')}
              </div>
              <div className="text-[11px] text-civic-slate-500 font-medium hidden sm:block">
                {t('nav.subtitle')}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-civic-navy bg-civic-slate-100 font-semibold'
                      : 'text-civic-slate-600 hover:text-civic-navy hover:bg-civic-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Track Report link */}
            <Link
              href="/track"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-civic-slate-700 hover:text-civic-navy border border-civic-slate-200 rounded-md hover:bg-civic-slate-50 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-civic-slate-500" />
              <span>{t('nav.track')}</span>
            </Link>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-civic-slate-200 text-civic-slate-700 hover:bg-civic-slate-50 transition-colors"
              title="Toggle Language / ভাষা পরিবর্তন"
            >
              <Languages className="w-3.5 h-3.5 text-civic-slate-500" />
              <span>{locale === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Primary CTA: Report an Incident */}
            <Link href="/report">
              <Button
                variant="primary"
                size="sm"
                className="font-medium bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="whitespace-nowrap">{t('nav.reportCta')}</span>
              </Button>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-civic-slate-600 hover:bg-civic-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-civic-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="col-span-2"
            >
              <Button
                variant="primary"
                size="md"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('nav.reportCta')}</span>
              </Button>
            </Link>
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="col-span-2"
            >
              <Button
                variant="outline"
                size="md"
                className="w-full flex items-center justify-center gap-2 text-xs"
              >
                <Lock className="w-4 h-4" />
                <span>{t('nav.track')}</span>
              </Button>
            </Link>
          </div>

          <div className="border-t border-civic-slate-100 pt-2 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-civic-slate-700 hover:bg-civic-slate-50"
                >
                  <Icon className="w-4 h-4 text-civic-slate-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-civic-slate-100 pt-3 flex justify-between items-center text-xs text-civic-slate-500">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:underline text-civic-navy font-medium"
            >
              Reviewer Portal
            </Link>
            <button
              onClick={toggleLanguage}
              className="font-medium text-civic-navy"
            >
              Switch to {locale === 'bn' ? 'English' : 'বাংলা'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
