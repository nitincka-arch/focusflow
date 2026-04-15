export interface Task {
  id: string;
  text: string;
  duration: number; // in minutes
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export type AppState = 'landing' | 'planning' | 'focusing' | 'completed' | 'dashboard';

export interface SessionData {
  goal: string;
  tasks: Task[];
  currentTaskIndex: number;
  streak: number;
  focusScore: number;
  totalFocusTime: number; // in minutes
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  context: string;
}
