import { create } from 'zustand';
import type {
  User,
  Project,
  ExpenseRequest,
  ExpenseItem,
  Category,
  ReimbursementSchedule,
  Notification,
  ExpenseStatus,
} from '../types';
import {
  mockUsers,
  mockProjects,
  mockExpenseRequests,
  mockCategories,
  mockReimbursementSchedule,
  mockNotifications,
} from '../data/mockData';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateRequestId(existingRequests: ExpenseRequest[]): string {
  const maxNum = existingRequests.reduce((max, r) => {
    const num = parseInt(r.requestId.split('-')[2] || '0', 10);
    return num > max ? num : max;
  }, 0);
  return `REQ-2026-${String(maxNum + 1).padStart(4, '0')}`;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  expenses: ExpenseRequest[];
  categories: Category[];
  schedule: ReimbursementSchedule;
  notifications: Notification[];
  sidebarOpen: boolean;

  // Auth
  switchUser: (userId: string) => void;

  // Sidebar
  setSidebarOpen: (open: boolean) => void;

  // Expenses
  submitExpense: (data: {
    projectId: string;
    items: Omit<ExpenseItem, 'id'>[];
    comments?: string;
    receiptUrl?: string;
  }) => ExpenseRequest;
  approveExpense: (expenseId: string, comment?: string) => void;
  rejectExpense: (expenseId: string, comment: string) => void;
  requestRevision: (expenseId: string, comment: string) => void;
  submitRevision: (expenseId: string, data: {
    items: Omit<ExpenseItem, 'id'>[];
    comments?: string;
    receiptUrl?: string;
  }) => void;
  schedulePayment: (expenseId: string, comment?: string) => void;
  markReimbursed: (expenseId: string, comment?: string) => void;
  bulkMarkReimbursed: (expenseIds: string[]) => void;

  // Projects
  createProject: (data: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (projectId: string, data: Partial<Project>) => void;

  // Users
  updateUser: (userId: string, data: Partial<User>) => void;
  createUser: (data: Omit<User, 'id'>) => void;

  // Categories
  addCategory: (data: Omit<Category, 'id'>) => void;
  removeCategory: (categoryId: string) => void;
  updateCategory: (categoryId: string, data: Partial<Category>) => void;

  // Schedule
  updateSchedule: (data: Partial<ReimbursementSchedule>) => void;

  // Notifications
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: mockUsers.find(u => u.id === 'usr-004') || null,
  users: mockUsers,
  projects: mockProjects,
  expenses: mockExpenseRequests,
  categories: mockCategories,
  schedule: mockReimbursementSchedule,
  notifications: mockNotifications,
  sidebarOpen: true,

  switchUser: (userId) => {
    const user = get().users.find(u => u.id === userId);
    if (user) set({ currentUser: user });
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  submitExpense: (data) => {
    const { currentUser, expenses } = get();
    if (!currentUser) throw new Error('No current user');

    const items: ExpenseItem[] = data.items.map(item => ({
      ...item,
      id: generateId(),
      subtotal: item.qty * item.pricePerUnit,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const now = new Date().toISOString();

    const newExpense: ExpenseRequest = {
      id: generateId(),
      requestId: generateRequestId(expenses),
      userId: currentUser.id,
      projectId: data.projectId,
      items,
      totalAmount,
      status: 'processing',
      receiptUrl: data.receiptUrl,
      comments: data.comments,
      auditTrail: [
        {
          id: generateId(),
          action: 'Submitted',
          actorId: currentUser.id,
          actorName: currentUser.name,
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    set({ expenses: [newExpense, ...expenses] });
    return newExpense;
  },

  approveExpense: (expenseId, comment) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const now = new Date().toISOString();
    set(state => ({
      expenses: state.expenses.map(e =>
        e.id === expenseId
          ? {
              ...e,
              status: 'approved' as ExpenseStatus,
              updatedAt: now,
              auditTrail: [
                ...e.auditTrail,
                {
                  id: generateId(),
                  action: 'Approved',
                  actorId: currentUser.id,
                  actorName: currentUser.name,
                  timestamp: now,
                  comment,
                },
              ],
            }
          : e
      ),
    }));
  },

  rejectExpense: (expenseId, comment) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const now = new Date().toISOString();
    set(state => ({
      expenses: state.expenses.map(e =>
        e.id === expenseId
          ? {
              ...e,
              status: 'rejected' as ExpenseStatus,
              updatedAt: now,
              auditTrail: [
                ...e.auditTrail,
                {
                  id: generateId(),
                  action: 'Rejected',
                  actorId: currentUser.id,
                  actorName: currentUser.name,
                  timestamp: now,
                  comment,
                },
              ],
            }
          : e
      ),
    }));
  },

  requestRevision: (expenseId, comment) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const now = new Date().toISOString();
    set(state => ({
      expenses: state.expenses.map(e =>
        e.id === expenseId
          ? {
              ...e,
              status: 'revision' as ExpenseStatus,
              updatedAt: now,
              auditTrail: [
                ...e.auditTrail,
                {
                  id: generateId(),
                  action: 'Revision Requested',
                  actorId: currentUser.id,
                  actorName: currentUser.name,
                  timestamp: now,
                  comment,
                },
              ],
            }
          : e
      ),
    }));
  },

  submitRevision: (expenseId, data) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const now = new Date().toISOString();

    const items: ExpenseItem[] = data.items.map(item => ({
      ...item,
      id: generateId(),
      subtotal: item.qty * item.pricePerUnit,
    }));
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    set(state => ({
      expenses: state.expenses.map(e =>
        e.id === expenseId
          ? {
              ...e,
              items,
              totalAmount,
              status: 'processing' as ExpenseStatus,
              comments: data.comments ?? e.comments,
              receiptUrl: data.receiptUrl ?? e.receiptUrl,
              updatedAt: now,
              auditTrail: [
                ...e.auditTrail,
                {
                  id: generateId(),
                  action: 'Revision Submitted',
                  actorId: currentUser.id,
                  actorName: currentUser.name,
                  timestamp: now,
                  comment: 'Resubmitted with requested changes.',
                },
              ],
            }
          : e
      ),
    }));
  },

  schedulePayment: (expenseId, comment) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const now = new Date().toISOString();
    set(state => ({
      expenses: state.expenses.map(e =>
        e.id === expenseId
          ? {
              ...e,
              status: 'scheduled' as ExpenseStatus,
              updatedAt: now,
              auditTrail: [
                ...e.auditTrail,
                {
                  id: generateId(),
                  action: 'Scheduled',
                  actorId: currentUser.id,
                  actorName: currentUser.name,
                  timestamp: now,
                  comment,
                },
              ],
            }
          : e
      ),
    }));
  },

  markReimbursed: (expenseId, comment) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const now = new Date().toISOString();
    set(state => ({
      expenses: state.expenses.map(e =>
        e.id === expenseId
          ? {
              ...e,
              status: 'reimbursed' as ExpenseStatus,
              updatedAt: now,
              auditTrail: [
                ...e.auditTrail,
                {
                  id: generateId(),
                  action: 'Reimbursed',
                  actorId: currentUser.id,
                  actorName: currentUser.name,
                  timestamp: now,
                  comment: comment || 'Payment processed.',
                },
              ],
            }
          : e
      ),
    }));
  },

  bulkMarkReimbursed: (expenseIds) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const now = new Date().toISOString();
    set(state => ({
      expenses: state.expenses.map(e =>
        expenseIds.includes(e.id) && e.status === 'scheduled'
          ? {
              ...e,
              status: 'reimbursed' as ExpenseStatus,
              updatedAt: now,
              auditTrail: [
                ...e.auditTrail,
                {
                  id: generateId(),
                  action: 'Reimbursed',
                  actorId: currentUser.id,
                  actorName: currentUser.name,
                  timestamp: now,
                  comment: 'Bulk payment processed.',
                },
              ],
            }
          : e
      ),
    }));
  },

  createProject: (data) => {
    const newProject: Project = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set(state => ({ projects: [...state.projects, newProject] }));
  },

  updateProject: (projectId, data) => {
    set(state => ({
      projects: state.projects.map(p =>
        p.id === projectId ? { ...p, ...data } : p
      ),
    }));
  },

  updateUser: (userId, data) => {
    set(state => ({
      users: state.users.map(u =>
        u.id === userId ? { ...u, ...data } : u
      ),
    }));
  },

  createUser: (data) => {
    const newUser: User = { ...data, id: generateId() };
    set(state => ({ users: [...state.users, newUser] }));
  },

  addCategory: (data) => {
    const newCat: Category = { ...data, id: generateId() };
    set(state => ({ categories: [...state.categories, newCat] }));
  },

  removeCategory: (categoryId) => {
    set(state => ({
      categories: state.categories.filter(c => c.id !== categoryId),
    }));
  },

  updateCategory: (categoryId, data) => {
    set(state => ({
      categories: state.categories.map(c =>
        c.id === categoryId ? { ...c, ...data } : c
      ),
    }));
  },

  updateSchedule: (data) => {
    set(state => ({
      schedule: { ...state.schedule, ...data, updatedAt: new Date().toISOString() },
    }));
  },

  markNotificationRead: (notifId) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === notifId ? { ...n, read: true } : n
      ),
    }));
  },

  markAllNotificationsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
    }));
  },
}));
