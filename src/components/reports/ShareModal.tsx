'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Twitter, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportNumber: string;
  title: string;
  locale?: string;
}

export function ShareModal({
  isOpen,
  onClose,
  reportNumber,
  title,
  locale = 'bn',
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://jababdihi.org/reports/${reportNumber}`;
  const shareText = `[Jababdihi Report ${reportNumber}] ${title}`;

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${currentUrl}`)}`, '_blank');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-[#C62828]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {locale === 'bn' ? 'প্রতিবেদন শেয়ার করুন' : 'Share Case Report'}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">{reportNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Quick social buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={shareWhatsApp}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 transition-colors group"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold">WhatsApp</span>
            </button>

            <button
              onClick={shareTwitter}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-sky-100 bg-sky-50/50 hover:bg-sky-50 text-sky-800 transition-colors group"
            >
              <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <Twitter className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold">X (Twitter)</span>
            </button>

            <button
              onClick={shareFacebook}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 text-blue-800 transition-colors group"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <Facebook className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold">Facebook</span>
            </button>
          </div>

          {/* Copy Link Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              {locale === 'bn' ? 'সরাসরি লিঙ্ক' : 'Direct Link'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono select-all focus:outline-none"
              />
              <Button
                size="sm"
                variant={copied ? 'primary' : 'outline'}
                onClick={handleCopy}
                className={`shrink-0 text-xs gap-1.5 ${copied ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (locale === 'bn' ? 'কপি হয়েছে' : 'Copied') : (locale === 'bn' ? 'কপি' : 'Copy')}</span>
              </Button>
            </div>
          </div>

          {/* Civic Notice */}
          <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {locale === 'bn'
              ? 'নাগরিক স্বার্থে যাচাইকৃত জনস্বার্থ প্রতিবেদন শেয়ার করুন। কোনো ব্যক্তিগত তথ্য প্রচার করবেন না।'
              : 'Share verified public-interest findings responsibly. Do not disclose non-public personal information.'}
          </p>
        </div>
      </div>
    </div>
  );
}
