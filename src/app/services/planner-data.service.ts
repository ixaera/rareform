import { Observable } from 'rxjs';
import { Task, Goal } from '../models/task.interface';
import { PeriodScope } from './period.service';

export type GoalScope = 'week' | 'quarter' | 'year';

export abstract class PlannerDataService {
  // === Period-based data fetching ===
  abstract getTasksForDay(dateKey: string): Observable<Task[]>;
  abstract getGoalsForPeriod(periodKey: string, scope: GoalScope): Observable<Goal[]>;

  // === Task CRUD ===
  abstract addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Observable<Task>;
  abstract updateTask(task: Task): Observable<Task>;
  abstract deleteTask(taskId: number): Observable<void>;

  // === Goal CRUD ===
  abstract addGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Observable<Goal>;
  abstract updateGoal(goal: Goal): Observable<Goal>;
  abstract deleteGoal(goalId: number): Observable<void>;

  // === Tag operations ===
  abstract getTags(): Observable<string[]>;
  abstract addTag(tag: string): Observable<string[]>;
  abstract renameTag(oldTag: string, newTag: string): Observable<string[]>;
  abstract deleteTag(tag: string): Observable<string[]>;
}
