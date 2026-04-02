import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { Plus, Trash2, Info } from 'lucide-react';
import FileUpload from '../ui/FileUpload';

type ItemRow = {
  category: string;
  itemName: string;
  qty: number;
  pricePerUnit: number;
};

const SubmissionForm: React.FC = () => {
  const { submitExpense, projects, currentUser, categories } = useAppStore();
  const navigate = useNavigate();

  const userProjects = projects.filter(p =>
    currentUser?.role !== 'user' || p.assignedUserIds.includes(currentUser?.id || '')
  );

  const [projectId, setProjectId] = useState(userProjects[0]?.id || '');
  const [items, setItems] = useState<ItemRow[]>([
    { category: categories[0]?.name || 'Travel', itemName: '', qty: 1, pricePerUnit: 0 },
  ]);
  const [comments, setComments] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

  const addItem = () => {
    setItems(prev => [...prev, { category: categories[0]?.name || 'Travel', itemName: '', qty: 1, pricePerUnit: 0 }]);
  };

  const removeItem = (idx: number) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof ItemRow, value: string | number) => {
    setItems(prev => prev.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    ));
  };

  const total = items.reduce((sum, item) => sum + (item.qty * item.pricePerUnit), 0);

  const isValid = projectId && items.length > 0 && items.every(i => i.itemName.trim() && i.qty >= 1 && i.pricePerUnit >= 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    const result = submitExpense({
      projectId,
      items: items.map(i => ({
        category: i.category,
        itemName: i.itemName,
        qty: i.qty,
        pricePerUnit: i.pricePerUnit,
        subtotal: i.qty * i.pricePerUnit,
      })),
      comments,
      receiptUrl,
    });
    setSubmittedId(result.id);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Expense Submitted!</h2>
        <p className="text-slate-500 mb-6 max-w-sm">
          Your expense request has been submitted successfully and is now pending review.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/expenses/${submittedId}`)}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            View Request
          </button>
          <button
            onClick={() => {
              setSubmitted(false);
              setItems([{ category: categories[0]?.name || 'Travel', itemName: '', qty: 1, pricePerUnit: 0 }]);
              setComments('');
              setReceiptUrl(undefined);
            }}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Project selection */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Project *</label>
        {userProjects.length === 0 ? (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            <Info size={16} />
            You are not assigned to any active projects.
          </div>
        ) : (
          <select
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
            required
          >
            {userProjects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Expense items table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-slate-700">Expense Items *</label>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <Plus size={14} /> Add Row
          </button>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-36">Category</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Item Description</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">Qty</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Unit Price ($)</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">Subtotal</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40">
                    <td className="px-2 py-2">
                      <select
                        value={item.category}
                        onChange={e => updateItem(idx, 'category', e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={e => updateItem(idx, 'itemName', e.target.value)}
                        placeholder="e.g. Flight to Chicago, Hotel (2 nights)"
                        className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        required
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={e => updateItem(idx, 'qty', parseInt(e.target.value) || 1)}
                        className="w-full text-xs text-right border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.pricePerUnit || ''}
                        onChange={e => updateItem(idx, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full text-xs text-right border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={`text-xs font-semibold ${item.qty * item.pricePerUnit > 0 ? 'text-slate-800' : 'text-slate-400'}`}>
                        ${(item.qty * item.pricePerUnit).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        disabled={items.length === 1}
                        className="p-1 text-slate-300 hover:text-rose-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td colSpan={4} className="px-3 py-3 text-sm font-semibold text-slate-700 text-right">
                    Total Amount
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className="text-base font-bold text-slate-900">
                      ${total.toFixed(2)}
                    </span>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Receipt upload */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Receipt / Supporting Document</label>
        <FileUpload value={receiptUrl} onChange={setReceiptUrl} />
      </div>

      {/* Comments */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Notes / Comments</label>
        <textarea
          value={comments}
          onChange={e => setComments(e.target.value)}
          rows={3}
          placeholder="Provide context or details about this expense request..."
          className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
        />
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="text-sm text-slate-500">
          Total: <span className="font-bold text-slate-900 text-base">${total.toFixed(2)}</span>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Submit Request
          </button>
        </div>
      </div>
    </form>
  );
};

export default SubmissionForm;
