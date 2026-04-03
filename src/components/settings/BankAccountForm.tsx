import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from '../../i18n/useTranslation';
import { Building2, CheckCircle2, AlertTriangle, CreditCard, Save } from 'lucide-react';
import type { BankAccount } from '../../types';

const INDONESIAN_BANKS = [
  'Bank BCA (Bank Central Asia)',
  'Bank BRI (Bank Rakyat Indonesia)',
  'Bank BNI (Bank Negara Indonesia)',
  'Bank Mandiri',
  'Bank CIMB Niaga',
  'Bank Danamon',
  'Bank Permata',
  'Bank BTN',
  'Bank BSI (Bank Syariah Indonesia)',
  'Bank Maybank Indonesia',
  'Bank OCBC NISP',
  'Bank Panin',
  'Bank Mega',
  'Bank BTPN / Jenius',
  'Bank Jago',
  'SeaBank',
  'Blu by BCA Digital',
  'Bank Neo Commerce (BNC)',
  'GoPay (GoTo Financial)',
  'OVO',
  'Dana',
  'ShopeePay',
];

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

const BankAccountForm: React.FC = () => {
  const { currentUser, updateUser } = useAppStore();
  const { t } = useTranslation();

  const existing = currentUser?.bankAccount;

  const [bankName, setBankName] = useState(existing?.bankName ?? '');
  const [accountNumber, setAccountNumber] = useState(existing?.accountNumber ?? '');
  const [accountName, setAccountName] = useState(existing?.accountName ?? '');
  const [saved, setSaved] = useState(false);
  const [touched, setTouched] = useState(false);

  // Reset form when user switches
  useEffect(() => {
    setBankName(currentUser?.bankAccount?.bankName ?? '');
    setAccountNumber(currentUser?.bankAccount?.accountNumber ?? '');
    setAccountName(currentUser?.bankAccount?.accountName ?? '');
    setTouched(false);
    setSaved(false);
  }, [currentUser?.id]);

  if (!currentUser) return null;

  const staffName = currentUser.name;
  const nameMatches = normalizeName(accountName) === normalizeName(staffName);
  const isComplete = bankName && accountNumber.trim() && accountName.trim();
  const canSave = isComplete && nameMatches;

  const handleSave = () => {
    if (!canSave) return;
    const bankAccount: BankAccount = {
      bankName,
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim(),
      verified: nameMatches,
    };
    updateUser(currentUser.id, { bankAccount });
    setSaved(true);
    setTouched(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const hasAccount = !!existing;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <Building2 size={16} className="text-indigo-500" />
        <h2 className="text-sm font-bold text-slate-800">{t.bank.title}</h2>
        {hasAccount && existing.verified && (
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 size={11} /> {t.bank.verified}
          </span>
        )}
        {hasAccount && !existing.verified && (
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <AlertTriangle size={11} /> {t.bank.unverified}
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        <p className="text-xs text-slate-500">{t.bank.description}</p>

        {/* Bank Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            {t.bank.bankName} <span className="text-rose-500">*</span>
          </label>
          <select
            value={bankName}
            onChange={e => { setBankName(e.target.value); setTouched(true); setSaved(false); }}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
          >
            <option value="">{t.bank.bankNamePlaceholder}</option>
            {INDONESIAN_BANKS.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Account Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            {t.bank.accountNumber} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              inputMode="numeric"
              value={accountNumber}
              onChange={e => { setAccountNumber(e.target.value.replace(/\D/g, '')); setTouched(true); setSaved(false); }}
              placeholder={t.bank.accountNumberPlaceholder}
              className="w-full pl-9 pr-4 text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          </div>
        </div>

        {/* Account Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            {t.bank.accountName} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={accountName}
            onChange={e => { setAccountName(e.target.value); setTouched(true); setSaved(false); }}
            placeholder={t.bank.accountNamePlaceholder}
            className={`w-full text-sm border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 transition-colors ${
              accountName && !nameMatches
                ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-400 bg-rose-50/30'
                : accountName && nameMatches
                ? 'border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-400 bg-emerald-50/30'
                : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-400'
            }`}
          />

          {/* Hint: must match staff name */}
          <p className="text-xs text-slate-400 mt-1.5">
            {t.bank.accountNameHint}
            <span className="font-semibold text-slate-600">{staffName}</span>
          </p>

          {/* Validation feedback */}
          {accountName && nameMatches && (
            <p className="flex items-center gap-1 text-xs text-emerald-600 mt-1.5 font-medium">
              <CheckCircle2 size={12} /> {t.bank.verified}
            </p>
          )}
          {accountName && !nameMatches && (
            <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5 font-medium">
              <AlertTriangle size={12} /> {t.bank.nameMismatch}
            </p>
          )}
        </div>

        {/* Success banner */}
        {saved && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
            <CheckCircle2 size={15} /> {t.bank.savedSuccess}
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end pt-1">
          <button
            onClick={handleSave}
            disabled={!canSave || (!touched && hasAccount)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            <Save size={15} />
            {t.bank.saveAccount}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankAccountForm;
