import React, { useState } from 'react';
import type { ExpenseRequest, ExpenseItem } from '../../types';
import { useAppStore } from '../../store/appStore';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import FileUpload from '../ui/FileUpload';

interface RevisionResponseFormProps {
  expense: ExpenseRequest;
  onSuccess: () => void;
  onCancel: () => void;
}

type ItemRow = Omit<ExpenseItem, 'id' | 'subtotal'>;

const RevisionResponseForm: React.FC<RevisionResponseFormProps> = ({ expense, onSuccess, onCancel }) => {
  const { submitRevision, categories } = useAppStore();
  const [items, setItems] = useState<ItemRow[]>(
    expense.items.map(i => ({
      category: i.category,
      itemName: i.itemName,
      qty: i.qty,
      pricePerUnit: i.pricePerUnit,
    }))
  );
  const [comments, setComments] = useState(expense.comments || '');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(expense.receiptUrl);

  const revisionComment = expense.auditTrail
    .filter(e => e.action === 'Revision Requested')
    .pop()?.comment;

  const updateItem = (idx: number, field: keyof ItemRow, value: string | number) => {
    setItems(prev => prev.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    setItems(prev => [...prev, { category: categories[0]?.name || 'Travel', itemName: '', qty: 1, pricePerUnit: 0 }]);
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const total = items.reduce((sum, item) => sum + (item.qty * item.pricePerUnit), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || items.some(i => !i.itemName || i.qty < 1)) return;
    submitRevision(expense.id, {
      items: items.map(i => ({ ...i, subtotal: i.qty * i.pricePerUnit })),
      comments,
      receiptUrl,
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {revisionComment && (
        <div className="flex gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
          <AlertCircle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800">Revision Requested</p>
            <p className="text-sm text-orange-700 mt-0.5">{revisionComment}</p>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-slate-700">Expense Items</label>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <Plus size={14} /> Add Item
          </button>
        </div>
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Item Name</th>
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Qty</th>
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Unit Price</th>
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Subtotal</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
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
                      placeholder="Item description"
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
                      className="w-16 text-xs text-right border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.pricePerUnit}
                      onChange={e => updateItem(idx, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                      className="w-24 text-xs text-right border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-medium text-slate-700">
                    ${(item.qty * item.pricePerUnit).toFixed(2)}
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200">
                <td colSpan={4} className="px-3 py-2.5 text-sm font-semibold text-slate-700 text-right">Total</td>
                <td className="px-3 py-2.5 text-sm font-bold text-slate-900 text-right">
                  ${total.toFixed(2)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Receipt</label>
        <FileUpload value={receiptUrl} onChange={setReceiptUrl} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Comments / Notes</label>
        <textarea
          value={comments}
          onChange={e => setComments(e.target.value)}
          rows={3}
          placeholder="Explain the changes made..."
          className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          Resubmit Request
        </button>
      </div>
    </form>
  );
};

export default RevisionResponseForm;
