// ── Status & Priority ──────────────────────────────
export type CardStatus = 'open' | 'in_progress' | 'in_review' | 'done' | 'blocked';
export type CardPriority = 'critical' | 'high' | 'medium' | 'low';

export const CARD_STATUSES: { value: CardStatus; label: string; color: string }[] = [
  { value: 'open', label: 'Open', color: '#8b949e' },
  { value: 'in_progress', label: 'In Progress', color: '#1f6feb' },
  { value: 'in_review', label: 'In Review', color: '#a371f7' },
  { value: 'done', label: 'Done', color: '#2ea043' },
  { value: 'blocked', label: 'Blocked', color: '#f85149' },
];

export const CARD_PRIORITIES: { value: CardPriority; label: string; color: string; icon: string }[] = [
  { value: 'critical', label: 'Critical', color: '#f85149', icon: '🔴' },
  { value: 'high', label: 'High', color: '#db6d28', icon: '🟠' },
  { value: 'medium', label: 'Medium', color: '#1f6feb', icon: '🔵' },
  { value: 'low', label: 'Low', color: '#8b949e', icon: '⚪' },
];

// ── Labels ─────────────────────────────────────────
export interface LabelOption {
  name: string;
  color: string;
  bg: string;
}

export const LABEL_OPTIONS: LabelOption[] = [
  { name: 'Bug', color: '#f85149', bg: 'rgba(248,81,73,0.15)' },
  { name: 'Feature', color: '#a371f7', bg: 'rgba(163,113,247,0.15)' },
  { name: 'Enhancement', color: '#1f6feb', bg: 'rgba(31,111,235,0.15)' },
  { name: 'Docs', color: '#2ea043', bg: 'rgba(46,160,67,0.15)' },
  { name: 'Urgent', color: '#db6d28', bg: 'rgba(219,109,40,0.15)' },
  { name: 'Design', color: '#d2a8ff', bg: 'rgba(210,168,255,0.15)' },
  { name: 'Testing', color: '#79c0ff', bg: 'rgba(121,192,255,0.15)' },
  { name: 'DevOps', color: '#56d364', bg: 'rgba(86,211,100,0.15)' },
];

// ── Core Entities ──────────────────────────────────

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: number;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  userEmail: string;
  role: 'manager' | 'member';
  joinedAt: number;
}

export interface Board {
  id: string;
  title: string;
  teamId: string;
  createdBy: string;
  createdAt: number;
}

export interface List {
  id: string;
  title: string;
  boardId: string;
  order: number;
  createdAt: number;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  listId: string;
  status: CardStatus;
  priority: CardPriority;
  assignedTo: string[];   // array of user emails
  labels: string[];       // label names from LABEL_OPTIONS
  startDate?: number | null;
  dueDate?: number | null;
  createdBy?: string;     // user email
  createdAt: number;
  updatedAt?: number;
  commentCount?: number;  // denormalized count
}

export interface Comment {
  id: string;
  cardId: string;
  authorId: string;       // Firebase UID
  authorEmail: string;
  content: string;
  createdAt: number;
}
