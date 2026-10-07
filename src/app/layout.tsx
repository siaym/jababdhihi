import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Bangladesh Civic Reporting Platform | বাংলাদেশ নাগরিক প্ল্যাটফর্ম',
  description:
    'A secure, evidence-based civic platform for documenting abuse, misconduct, corruption, and institutional violations in Bangladesh. Report securely, anonymously, and transparently.',
  keywords: [
    'Bangladesh civic reporting',
    'police misconduct Bangladesh',
    'corruption reporting BD',
    'abuse prevention Bangladesh',
    'citizen incident documentation',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body className="min-h-screen flex flex-col bg-civic-slate-50 text-civic-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
        <I18nProvider defaultLocale="bn">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
