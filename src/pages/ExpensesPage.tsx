import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import ExpenseCard from '../components/expenses/ExpenseCard';
import StatusPill from '../components/ui/StatusPill';
import EmptyState from '../components/ui/EmptyState';
import { Search, SlidersHorizontal, X, FileText } from 'lucide-react';
import type { ExpenseStatus } from '../types';

const ALL_STATUSES: ExpenseStatus[] = ['processing', 'approved', 'rejected', 'revision', 'scheduled', 'reimbursed'];

const ExpensesPage: React.FC = () => {
  const { currentUser, expenses, projects, users } = useAppStore();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ExpenseStatus | null>(
    (searchParams.get('status') as ExpenseStatus) || null
  );
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';

  // Base list filtered by role
  const baseExpenses = useMemo(() => {
    if (currentUser.role === 'user') return expenses.filter(e => e.userId === currentUser.id);
    if (currentUser.role === 'admin') {
      const myProjectIds = projects.filter(p => p.adminId === currentUser.id).map(p => p.id);
      return expenses.filter(e => myProjectIds.includes(e.projectId));
    }
    return expenses;
  }, [expenses, currentUser, projects]);

  const filtered = useMemo(() => {
    return baseExpenses.filter(e => {
      if (selectedStatus && e.status !== selectedStatus) return false;
      if (selectedProject && e.projectId !== selectedProject) return false;
      if (isAdmin && selectedUser && e.userId !== selectedUser) return false;
      if (dateFrom && new Date(e.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(e.createdAt) > new Date(dateTo + 'T23:59:59')) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchesId = e.requestId.toLowerCase().includes(q);
        const matchesItem = e.items.some(i => i.itemName.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
        const project = projects.find(p => p.id === e.projectId);
        const matchesProject = project?.name.toLowerCase().includes(q);
        if (!matchesId && !matchesItem && !matchesProject) return false;
      }
      return true;
    });
  }, [baseExpenses, selectedStatus, selectedProject, selectedUser, dateFrom, dateTo, search, isAdmin, projects]);

  const clearFilters = () => {
    setSelectedStatus(null);
    setSelectedProject('');
    setSelectedUser('');
    setDateFrom('');
    setDateTo('');
    setSearch('');
  };

  const hasFilters = selectedStatus || selectedProject || selectedUser || dateFrom || dateTo || search;

  const availableProjects = isAdmin
    ? (currentUser.role === 'admin'
        ? projects.filter(p => p.adminId === currentUser.id)
        : projects)
    : projects.filter(p => currentUser.projectIds?.includes(p.id));

  const teamUsers = users.filter(u => u.role === 'user');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isAdmin ? 'All Expenses' : 'My Expenses'}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} request{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition-colors ${showFilters ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasFilters && <span className="w-2 h-2 rounded-full bg-rose-400" />}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by item name, category, or request ID..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedStatus(null)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${!selectedStatus ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
        >
          All ({baseExpenses.length})
        </button>
        {ALL_STATUSES.map(status => {
          const count = baseExpenses.filter(e => e.status === status).length;
          if (count === 0) return null;
          return (
            <button
              key={status}
              onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
              className={`transition-all ${selectedStatus === status ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}`}
            >
              <StatusPill status={status} />
              <span className="sr-only">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Project</label>
              <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white">
                <option value="">All Projects</option>
                {availableProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            {isAdmin && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Team Member</label>
                <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white">
                  <option value="">All Members</option>
                  {teamUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">From Date</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">To Date</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800">
              <X size={13} /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} className="text-slate-300" />}
          title="No expenses found"
          description={hasFilters ? 'Try adjusting your filters.' : 'No expense requests yet.'}
          action={hasFilters ? <button onClick={clearFilters} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">Clear filters</button> : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(e => <ExpenseCard key={e.id} expense={e} />)}
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
