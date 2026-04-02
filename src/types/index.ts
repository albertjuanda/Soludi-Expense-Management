export type UserRole = 'super_admin' | 'admin' | 'user';

export type ExpenseStatus =
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'revision'
  | 'scheduled'
  | 'reimbursed';

export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled';

export type ReimbursementFrequency = 'weekly' | 'biweekly' | 'monthly';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  projectIds?: string[];
  department?: string;
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  assignedUserIds: string[];
  adminId: string;
  budget?: number;
  createdAt: string;
}

export interface ExpenseItem {
  id: string;
  category: string;
  itemName: string;
  qty: number;
  pricePerUnit: number;
  subtotal: number;
}

export interface AuditEntry {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  timestamp: string;
  comment?: string;
}

export interface ExpenseRequest {
  id: string;
  requestId: string;
  userId: string;
  projectId: string;
  items: ExpenseItem[];
  totalAmount: number;
  status: ExpenseStatus;
  receiptUrl?: string;
  comments?: string;
  auditTrail: AuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface ReimbursementSchedule {
  id: string;
  frequency: ReimbursementFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  nextPaymentDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}
