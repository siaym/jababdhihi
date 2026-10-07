import React from 'react';
import { ReportStatusHistoryItem, ReportStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { Badge } from './Badge';
import { CheckCircle, Clock } from 'lucide-react';

interface StatusTimelineProps {
  history: ReportStatusHistoryItem[];
  currentStatus: ReportStatus;
}

export function StatusTimeline({ history, currentStatus }: StatusTimelineProps) {
  const { locale } = useI18n();

  if (!history || history.length === 0) {
    return (
      <div className="py-4 text-sm text-civic-slate-500">
        {locale === 'bn' ? 'কোনো ইতিহাস পাওয়া যায়নি' : 'No history records available'}
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-civic-slate-200">
      {history.map((item, index) => {
        const isLatest = index === history.length - 1;

        return (
          <div key={item.id || index} className="relative group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                isLatest
                  ? 'border-verified bg-verified-light text-verified'
                  : 'border-civic-slate-400 bg-civic-slate-100 text-civic-slate-500'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isLatest ? 'bg-verified' : 'bg-civic-slate-400'
                }`}
              />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge status={item.new_status} />
                <span className="text-xs text-civic-slate-500">
                  {formatDate(item.created_at, locale)}
                </span>
              </div>

              {item.public_note && (
                <p className="text-sm text-civic-slate-700 bg-civic-slate-50 p-2.5 rounded border border-civic-slate-100 mt-1">
                  {item.public_note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
