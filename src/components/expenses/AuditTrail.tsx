import React from 'react';
import type { AuditEntry } from '../../types';
import { format } from 'date-fns';
import Avatar from '../ui/Avatar';
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Send,
  CalendarClock,
  Banknote,
  Clock,
} from 'lucide-react';

interface AuditTrailProps {
  entries: AuditEntry[];
}

type ActionConfig = {
  icon: React.ReactNode;
  dotColor: string;
  lineColor: string;
};

function getActionConfig(action: string): ActionConfig {
  const a = action.toLowerCase();
  if (a.includes('approved')) return {
    icon: <CheckCircle2 size={14} className="text-emerald-600" />,
    dotColor: 'bg-emerald-100 border-emerald-300',
    lineColor: 'bg-emerald-200',
  };
  if (a.includes('reject')) return {
    icon: <XCircle size={14} className="text-rose-600" />,
    dotColor: 'bg-rose-100 border-rose-300',
    lineColor: 'bg-rose-200',
  };
  if (a.includes('revision')) return {
    icon: <RefreshCw size={14} className="text-orange-600" />,
    dotColor: 'bg-orange-100 border-orange-300',
    lineColor: 'bg-orange-200',
  };
  if (a.includes('submit')) return {
    icon: <Send size={14} className="text-indigo-600" />,
    dotColor: 'bg-indigo-100 border-indigo-300',
    lineColor: 'bg-indigo-200',
  };
  if (a.includes('schedul')) return {
    icon: <CalendarClock size={14} className="text-indigo-600" />,
    dotColor: 'bg-indigo-100 border-indigo-300',
    lineColor: 'bg-indigo-200',
  };
  if (a.includes('reimburse') || a.includes('paid')) return {
    icon: <Banknote size={14} className="text-green-600" />,
    dotColor: 'bg-green-100 border-green-300',
    lineColor: 'bg-green-200',
  };
  return {
    icon: <Clock size={14} className="text-slate-500" />,
    dotColor: 'bg-slate-100 border-slate-300',
    lineColor: 'bg-slate-200',
  };
}

const AuditTrail: React.FC<AuditTrailProps> = ({ entries }) => {
  const sorted = [...entries].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-0">
      {sorted.map((entry, idx) => {
        const config = getActionConfig(entry.action);
        const isLast = idx === sorted.length - 1;

        return (
          <div key={entry.id} className="flex gap-4">
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${config.dotColor}`}>
                {config.icon}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-4 my-1 ${config.lineColor}`} />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-6 ${isLast ? '' : ''}`}>
              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar name={entry.actorName} size="xs" />
                    <div>
                      <span className="text-sm font-semibold text-slate-800">{entry.action}</span>
                      <span className="text-xs text-slate-500 ml-1">by {entry.actorName}</span>
                    </div>
                  </div>
                  <time className="text-xs text-slate-400 flex-shrink-0">
                    {format(new Date(entry.timestamp), 'MMM d, yyyy · h:mm a')}
                  </time>
                </div>
                {entry.comment && (
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                    "{entry.comment}"
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AuditTrail;
