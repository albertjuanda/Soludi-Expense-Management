import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useTranslation } from '../i18n/useTranslation';
import { formatRp } from '../utils/currency';
import AuditTrail from '../components/expenses/AuditTrail';
import RevisionResponseForm from '../components/expenses/RevisionResponseForm';
import StatusPill from '../components/ui/StatusPill';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';
import { ArrowLeft, FileText, CheckCircle2, XCircle, RefreshCw, CalendarClock, Banknote, Receipt, Calendar, User, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';

const ExpenseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, expenses, users, projects, approveExpense, rejectExpense, requestRevision, schedulePayment, markReimbursed } = useAppStore();
  const { t } = useTranslation();

  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [revisionModal, setRevisionModal] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [reimbursedModal, setReimbursedModal] = useState(false);
  const [comment, setComment] = useState('');
  const [reimbursedComment, setReimbursedComment] = useState('');

  if (!currentUser) return null;
  const expense = expenses.find(e => e.id === id);
  if (!expense) return (
    <div className="flex flex-col items-center justify-center py-24">
      <p className="text-slate-500">Expense not found.</p>
      <button onClick={() => navigate('/expenses')} className="mt-4 text-indigo-600 font-semibold text-sm">← {t.actions.back}</button>
    </div>
  );

  const submitter = users.find(u => u.id === expense.userId);
  const project = projects.find(p => p.id === expense.projectId);
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';
  const isSuperAdmin = currentUser.role === 'super_admin';
  const isSubmitter = currentUser.id === expense.userId;

  const handleApprove = () => {
    approveExpense(expense.id, comment || undefined);
    setApproveModal(false);
    setComment('');
  };

  const handleReject = () => {
    if (!comment.trim()) return;
    rejectExpense(expense.id, comment);
    setRejectModal(false);
    setComment('');
  };

  const handleRevision = () => {
    if (!comment.trim()) return;
    requestRevision(expense.id, comment);
    setRevisionModal(false);
    setComment('');
  };

  const handleSchedule = () => {
    schedulePayment(expense.id);
    setScheduleModal(false);
  };

  const handleReimbursed = () => {
    markReimbursed(expense.id, reimbursedComment || undefined);
    setReimbursedModal(false);
    setReimbursedComment('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors">
        <ArrowLeft size={16} />
        {t.actions.back}
      </button>

      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{expense.requestId}</p>
        <p className="text-4xl font-bold text-slate-900 mb-3">
          {formatRp(expense.totalAmount)}
        </p>
        <div className="flex justify-center">
          <StatusPill status={expense.status} />
        </div>
        <p className="text-xs text-slate-400 mt-3">
          {t.expenseDetail.submitted} {format(new Date(expense.createdAt), 'MMMM d, yyyy · h:mm a')}
        </p>
      </div>

      {/* Claim information */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">{t.expenseDetail.claimInformation}</h2>
        </div>
        <div className="divide-y divide-slate-50">
          <div className="flex items-center gap-3 px-5 py-3.5">
            <User size={15} className="text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-400 w-32 flex-shrink-0">{t.expenseDetail.submittedBy}</span>
            <div className="flex items-center gap-2">
              {submitter && <Avatar name={submitter.name} size="xs" />}
              <span className="text-sm font-semibold text-slate-800">{submitter?.name || 'Unknown'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3.5">
            <FolderOpen size={15} className="text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-400 w-32 flex-shrink-0">{t.nav.projects}</span>
            <span className="text-sm font-semibold text-slate-800">{project?.name || '—'}</span>
          </div>
          <div className="flex items-center gap-3 px-5 py-3.5">
            <FileText size={15} className="text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-400 w-32 flex-shrink-0">{t.expenseDetail.requestId}</span>
            <span className="text-sm font-semibold text-slate-800">{expense.requestId}</span>
          </div>
          <div className="flex items-center gap-3 px-5 py-3.5">
            <Calendar size={15} className="text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-400 w-32 flex-shrink-0">{t.expenseDetail.requestDate}</span>
            <span className="text-sm font-semibold text-slate-800">{format(new Date(expense.createdAt), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-3 px-5 py-3.5">
            <Calendar size={15} className="text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-400 w-32 flex-shrink-0">{t.expenseDetail.lastUpdated}</span>
            <span className="text-sm font-semibold text-slate-800">{format(new Date(expense.updatedAt), 'MMM d, yyyy · h:mm a')}</span>
          </div>
          {expense.comments && (
            <div className="flex items-start gap-3 px-5 py-3.5">
              <Receipt size={15} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-slate-400 w-32 flex-shrink-0">{t.expenseDetail.notes}</span>
              <p className="text-sm text-slate-600">{expense.comments}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">{t.expenseDetail.expenseItems}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.expenseDetail.category}</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.expenseDetail.item}</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.expenseDetail.qty}</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.expenseDetail.unitPrice}</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.expenseDetail.subtotal}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expense.items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg">{item.category}</span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{item.itemName}</td>
                  <td className="px-3 py-3.5 text-center text-slate-600">{item.qty}</td>
                  <td className="px-3 py-3.5 text-right text-slate-600">
                    {formatRp(item.pricePerUnit)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-800">
                    {formatRp(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200">
                <td colSpan={4} className="px-5 py-3.5 text-sm font-bold text-slate-700 text-right">{t.expenseDetail.total}</td>
                <td className="px-5 py-3.5 text-right text-base font-bold text-indigo-700">
                  {formatRp(expense.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Receipt */}
      {expense.receiptUrl && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-3">{t.expenseDetail.proofOfTransaction}</h2>
          <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50 w-fit">
            <div className="w-10 h-12 bg-white border border-slate-200 rounded-lg flex flex-col items-center justify-center shadow-sm">
              <div className="w-6 h-2 bg-rose-500 rounded-sm mb-0.5" />
              <FileText size={14} className="text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-600">{expense.receiptUrl}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t.expenseDetail.receiptDocument}</p>
            </div>
          </div>
        </div>
      )}

      {/* Settlement info for reimbursed */}
      {expense.status === 'reimbursed' && (() => {
        const reimbursedEntry = expense.auditTrail.find(a => a.action === 'Reimbursed');
        return reimbursedEntry ? (
          <div className="bg-white border border-emerald-200 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-3">{t.expenseDetail.settlementReport}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">{t.expenseDetail.totalApprovedAmount}</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">{formatRp(expense.totalAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{t.expenseDetail.totalVariance}</p>
                <p className="text-base font-bold text-emerald-600 mt-0.5">$0.00</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{t.expenseDetail.disbursementDate}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{format(new Date(reimbursedEntry.timestamp), 'MMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{t.expenseDetail.processedBy}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{reimbursedEntry.actorName}</p>
              </div>
              {reimbursedEntry.comment && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-400">{t.expenseDetail.disbursementNote}</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{reimbursedEntry.comment}</p>
                </div>
              )}
            </div>
          </div>
        ) : null;
      })()}

      {/* Revision response (user) */}
      {expense.status === 'revision' && isSubmitter && (
        <div className="bg-white border border-amber-200 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4">{t.expenseDetail.respondToRevision}</h2>
          <RevisionResponseForm
            expense={expense}
            onSuccess={() => navigate('/expenses')}
            onCancel={() => navigate('/expenses')}
          />
        </div>
      )}

      {/* Admin action buttons */}
      {isAdmin && !isSubmitter && expense.status === 'processing' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-3">{t.expenseDetail.adminActions}</h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setApproveModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors">
              <CheckCircle2 size={16} /> {t.actions.approve}
            </button>
            <button onClick={() => setRevisionModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors">
              <RefreshCw size={16} /> {t.actions.requestRevision}
            </button>
            <button onClick={() => setRejectModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-colors">
              <XCircle size={16} /> {t.actions.reject}
            </button>
          </div>
        </div>
      )}

      {/* Super admin: schedule */}
      {isSuperAdmin && expense.status === 'approved' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-3">{t.expenseDetail.paymentActions}</h2>
          <button onClick={() => setScheduleModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">
            <CalendarClock size={16} /> {t.actions.schedulePayment}
          </button>
        </div>
      )}

      {/* Super admin: mark reimbursed */}
      {isSuperAdmin && expense.status === 'scheduled' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-3">{t.expenseDetail.paymentActions}</h2>
          <button onClick={() => setReimbursedModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors">
            <Banknote size={16} /> {t.actions.markReimbursed}
          </button>
        </div>
      )}

      {/* Audit trail */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-slate-800 mb-5">{t.expenseDetail.requestHistory}</h2>
        <AuditTrail entries={expense.auditTrail} />
      </div>

      {/* Modals */}
      <Modal isOpen={approveModal} onClose={() => { setApproveModal(false); setComment(''); }} title={t.actions.approve}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">{t.expenseDetail.approveConfirm} <span className="font-semibold">{expense.requestId}</span> {t.expenseDetail.for} <span className="font-semibold">{formatRp(expense.totalAmount)}</span>?</p>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.expenseDetail.commentOptional}</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder={t.expenseDetail.approveCommentPlaceholder}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setApproveModal(false); setComment(''); }} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">{t.actions.cancel}</button>
            <button onClick={handleApprove} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-2">
              <CheckCircle2 size={15} /> {t.actions.confirmApproval}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={rejectModal} onClose={() => { setRejectModal(false); setComment(''); }} title={t.actions.reject}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">{t.expenseDetail.rejectRequired}</p>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.expenseDetail.rejectReason} <span className="text-rose-500">*</span></label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} placeholder={t.expenseDetail.rejectPlaceholder}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setRejectModal(false); setComment(''); }} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">{t.actions.cancel}</button>
            <button onClick={handleReject} disabled={!comment.trim()} className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2">
              <XCircle size={15} /> {t.actions.confirmRejection}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={revisionModal} onClose={() => { setRevisionModal(false); setComment(''); }} title={t.actions.requestRevision}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">{t.expenseDetail.revisionDesc}</p>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.expenseDetail.revisionInstructions} <span className="text-rose-500">*</span></label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} placeholder={t.expenseDetail.revisionPlaceholder}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setRevisionModal(false); setComment(''); }} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">{t.actions.cancel}</button>
            <button onClick={handleRevision} disabled={!comment.trim()} className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2">
              <RefreshCw size={15} /> {t.actions.sendRevisionRequest}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={scheduleModal} onClose={() => setScheduleModal(false)} title={t.actions.schedulePayment}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">{t.expenseDetail.scheduleDesc}</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setScheduleModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">{t.actions.cancel}</button>
            <button onClick={handleSchedule} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-2">
              <CalendarClock size={15} /> {t.actions.confirmSchedule}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={reimbursedModal} onClose={() => { setReimbursedModal(false); setReimbursedComment(''); }} title={t.actions.markReimbursed}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">{t.expenseDetail.reimbursedConfirm} <span className="font-semibold">{expense.requestId}</span>.</p>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.expenseDetail.disbursementNote} ({t.expenseDetail.optional})</label>
            <textarea value={reimbursedComment} onChange={e => setReimbursedComment(e.target.value)} rows={3} placeholder={t.expenseDetail.disbursementNotePlaceholder}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setReimbursedModal(false); setReimbursedComment(''); }} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">{t.actions.cancel}</button>
            <button onClick={handleReimbursed} className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors flex items-center gap-2">
              <Banknote size={15} /> {t.actions.confirmPayment}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExpenseDetailPage;
