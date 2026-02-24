export interface Task {
  id: number;
  text: string;
  completed: boolean;
  tags: string[];
  date: string;            // ISO date "2026-01-27"
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}

export interface Goal {
  id: number;
  text: string;
  completed: boolean;
  tags: string[];
  scope: 'week' | 'quarter' | 'year';
  periodKey: string;       // "2026-W05", "2026-Q1", or "2026"
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}
