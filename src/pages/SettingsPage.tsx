import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useTranslation } from '../i18n/useTranslation';
import Modal from '../components/ui/Modal';
import BulkReimbursement from '../components/reports/BulkReimbursement';
import BankAccountForm from '../components/settings/BankAccountForm';
import { Plus, Pencil, Trash2, Tag, CalendarClock, AlertTriangle } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { categories, addCategory, updateCategory, removeCategory } = useAppStore();
  const { t } = useTranslation();

  const [newCat, setNewCat] = useState('');
  const [editCat, setEditCat] = useState<{ id: string; name: string } | null>(null);
  const [deleteCat, setDeleteCat] = useState<string | null>(null);

  const handleAddCategory = () => {
    if (!newCat.trim()) return;
    addCategory({ name: newCat.trim(), color: "indigo" });
    setNewCat('');
  };

  const handleEditCategory = () => {
    if (!editCat) return;
    updateCategory(editCat.id, { name: editCat.name });
    setEditCat(null);
  };

  const handleDeleteCategory = () => {
    if (!deleteCat) return;
    removeCategory(deleteCat);
    setDeleteCat(null);
  };

  const catToDelete = categories.find(c => c.id === deleteCat);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.settings.title}</h1>
        <p className="text-slate-500 text-sm mt-1">{t.settings.description}</p>
      </div>

      {/* Categories */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Tag size={16} className="text-indigo-500" />
          <h2 className="text-sm font-bold text-slate-800">{t.settings.expenseCategories}</h2>
          <span className="ml-auto text-xs font-semibold text-slate-400">{categories.length} {t.settings.categories}</span>
        </div>

        <div className="divide-y divide-slate-50">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
              <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Tag size={13} className="text-indigo-500" />
              </div>
              <span className="text-sm font-medium text-slate-800 flex-1">{cat.name}</span>
              <div className="flex gap-1">
                <button onClick={() => setEditCat({ id: cat.id, name: cat.name })}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                  <Pencil size={13} />
                </button>
                <button onClick={() => setDeleteCat(cat.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new category */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
              placeholder={t.settings.newCategoryPlaceholder}
              className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
            />
            <button
              onClick={handleAddCategory}
              disabled={!newCat.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors"
            >
              <Plus size={15} /> {t.actions.add}
            </button>
          </div>
        </div>
      </div>

      {/* Bank Account */}
      <BankAccountForm />

      {/* Payment Schedule */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CalendarClock size={16} className="text-indigo-500" />
          <h2 className="text-base font-bold text-slate-800">{t.settings.paymentSchedule}</h2>
        </div>
        <BulkReimbursement />
      </div>

      {/* Edit category modal */}
      <Modal isOpen={!!editCat} onClose={() => setEditCat(null)} title={t.settings.editCategory}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.settings.categoryName}</label>
            <input
              type="text"
              value={editCat?.name || ''}
              onChange={e => setEditCat(c => c ? { ...c, name: e.target.value } : null)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setEditCat(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">{t.actions.cancel}</button>
            <button onClick={handleEditCategory} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl">{t.actions.save}</button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal isOpen={!!deleteCat} onClose={() => setDeleteCat(null)} title={t.settings.deleteCategory}>
        <div className="space-y-4">
          <div className="flex gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertTriangle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">
              {t.settings.deleteConfirm} <span className="font-bold">{catToDelete?.name}</span>? {t.settings.cannotUndo}
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteCat(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">{t.actions.cancel}</button>
            <button onClick={handleDeleteCategory} className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-2">
              <Trash2 size={14} /> {t.actions.delete}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
