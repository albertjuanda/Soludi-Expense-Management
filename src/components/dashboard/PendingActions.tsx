import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ExpenseRequest } from '../../types';
import { useAppStore } from '../../store/appStore';
import StatusPill from '../ui/StatusPill';
import { AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PendingActionsProps {
  expenses: ExpenseRequest[];
  role: string;
}

const PendingActions: React.FC<PendingActionsProps> = ({ expenses, role }) => {
  const { users } = useAppStore();
  const navigate = useNavigate();

  const pendingItems = role === 'user'
    ? expenses.filter(e => e.status === 'revision')
    : expenses.filter(e => e.status === 'processing');

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        {role === 'user'
          ? <AlertCircle size={16} className="text-orange-500" />
          : <Clock size={16} className="text-amber-500" />
        }
        <h3 className="text-sm font-bold text-slate-800">
          {role === 'user' ? 'Needs Your Attention' : 'Pending Approvals'}
        </h3>
        <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-700 rounded-full">
          {pendingItems.length}
        </span>
      </div>
      {pendingItems.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-slate-500">All clear! No pending actions.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {pendingItems.slice(0, 6).map(expense => {
            const user = users.find(u => u.id === expense.userId);
            const lastEntry = expense.auditTrail[expense.auditTrail.length - 1];
            return (
              <div
                key={expense.id}
                onClick={() => navigate(`/expenses/${expense.id}`)}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-slate-700">{expense.requestId}</span>
                    <StatusPill status={expense.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.name} · {formatDistanceToNow(new Date(lastEntry?.timestamp || expense.updatedAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold text-slate-700">
                    ${expense.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>
            );
          })}
          {pendingItems.length > 6 && (
            <div
              onClick={() => navigate('/expenses')}
              className="px-5 py-3 text-center text-xs text-indigo-600 font-semibold hover:bg-indigo-50 cursor-pointer transition-colors"
            >
              +{pendingItems.length - 6} more → View all
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PendingActions;
