export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  createdAt: string;
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

export type Section = 'tasks' | 'pomodoro' | 'notes' | 'habits' | 'links';
