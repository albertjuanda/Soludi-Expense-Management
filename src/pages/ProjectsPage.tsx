import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useTranslation } from '../i18n/useTranslation';
import ProjectCard from '../components/projects/ProjectCard';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { Plus, Search, FolderOpen } from 'lucide-react';
import type { ProjectStatus } from '../types';

const ProjectsPage: React.FC = () => {
  const { currentUser, projects, users, createProject } = useAppStore();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    adminId: '',
    budget: '',
    assignedUserIds: [] as string[],
    status: 'active' as ProjectStatus,
  });

  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';

  const visibleProjects = projects.filter(p => {
    if (currentUser.role === 'user') return p.assignedUserIds.includes(currentUser.id);
    if (currentUser.role === 'admin') return p.adminId === currentUser.id;
    return true;
  });

  const filtered = visibleProjects.filter(p => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'super_admin');
  const fieldUsers = users.filter(u => u.role === 'user');

  const handleCreate = () => {
    if (!form.name || !form.startDate || !form.endDate) return;
    createProject({
      name: form.name,
      description: form.description,
      startDate: form.startDate,
      endDate: form.endDate,
      adminId: form.adminId || currentUser.id,
      budget: form.budget ? parseFloat(form.budget) : undefined,
      assignedUserIds: form.assignedUserIds,
      status: form.status,
    });
    setForm({ name: '', description: '', startDate: '', endDate: '', adminId: '', budget: '', assignedUserIds: [], status: 'active' });
    setShowCreate(false);
  };

  const toggleAssignUser = (userId: string) => {
    setForm(f => ({
      ...f,
      assignedUserIds: f.assignedUserIds.includes(userId)
        ? f.assignedUserIds.filter(id => id !== userId)
        : [...f.assignedUserIds, userId],
    }));
  };

  const statuses: Array<{ value: ProjectStatus | ''; label: string }> = [
    { value: '', label: t.projects.allStatuses },
    { value: 'active', label: t.projects.active },
    { value: 'on_hold', label: t.projects.onHold },
    { value: 'completed', label: t.projects.completed },
    { value: 'cancelled', label: t.projects.cancelled },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.projects.title}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} {t.nav.projects.toLowerCase()}</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">
            <Plus size={16} /> {t.actions.newProject}
          </button>
        )}
      </div>

      {/* Search & filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={`${t.actions.search}...`}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
        </div>
        <div className="flex gap-2">
          {statuses.map(s => (
            <button key={s.value} onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${statusFilter === s.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={28} className="text-slate-300" />}
          title={t.projects.noProjects}
          description={search ? t.projects.noProjectsSearch : t.projects.noProjectsAvail}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}

      {/* Create project modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={t.projects.createTitle}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.projects.projectName} <span className="text-rose-500">*</span></label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={t.projects.projectNamePlaceholder}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.projects.description}</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder={t.projects.descriptionPlaceholder}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.projects.startDate} <span className="text-rose-500">*</span></label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.projects.endDate} <span className="text-rose-500">*</span></label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.projects.budget}</label>
              <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} placeholder="0.00"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.projects.projectAdmin}</label>
              <select value={form.adminId} onChange={e => setForm(f => ({ ...f, adminId: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white">
                <option value="">{t.projects.currentUser}</option>
                {adminUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.projects.assignTeam}</label>
            <div className="grid grid-cols-2 gap-2">
              {fieldUsers.map(u => (
                <label key={u.id} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${form.assignedUserIds.includes(u.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                  <input type="checkbox" checked={form.assignedUserIds.includes(u.id)} onChange={() => toggleAssignUser(u.id)} className="w-3.5 h-3.5 text-indigo-600 rounded" />
                  <span className="text-xs font-medium text-slate-700">{u.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">{t.actions.cancel}</button>
            <button onClick={handleCreate} disabled={!form.name || !form.startDate || !form.endDate}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2">
              <Plus size={15} /> {t.actions.createProject}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
