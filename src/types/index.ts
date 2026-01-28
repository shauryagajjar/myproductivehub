export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  createdAt: string;
  dueDate?: string;
  description?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  name: string;
  completedDates: string[];
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

export interface PomodoroStats {
  sessions: number;
  lastReset: string;
}

export type Section = 'dashboard' | 'tasks' | 'pomodoro' | 'notes' | 'habits' | 'links';
