import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Jababdihi | জবাবদিহি — A More Accountable Bangladesh Together',
  description:
    'A people-powered civic platform to document and raise awareness about abuse, corruption, misconduct, and public-interest issues across Bangladesh.',
  keywords: [
    'Jababdihi',
    'জবাবদিহি',
    'Bangladesh civic reporting',
    'police misconduct Bangladesh',
    'corruption reporting BD',
    'public accountability Bangladesh',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#F8F7F3] text-[#111827] selection:bg-[#FFEBEE] selection:text-[#C62828]">
        <I18nProvider defaultLocale="en">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
