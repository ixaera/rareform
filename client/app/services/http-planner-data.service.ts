import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, EMPTY, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Task, Goal } from '../models/task.interface';
import { PlannerDataService, GoalScope } from './planner-data.service';

@Injectable()
export class HttpPlannerDataService extends PlannerDataService {
  private http = inject(HttpClient);
  private opts = { withCredentials: true };

  // ── Tasks ──────────────────────────────────────────────────────────────────

  getTasksForDay(dateKey: string): Observable<Task[]> {
    return this.http
      .get<{ tasks: Task[] }>(`/api/tasks?date=${dateKey}`, this.opts)
      .pipe(map(r => r.tasks), catchError(this.handleError));
  }

  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Observable<Task> {
    return this.http
      .post<{ task: Task }>('/api/tasks', task, this.opts)
      .pipe(map(r => r.task), catchError(this.handleError));
  }

  updateTask(task: Task): Observable<Task> {
    const { id, text, completed, tags, goalIds } = task;
    return this.http
      .patch<{ task: Task }>(`/api/tasks/${id}`, { text, completed, tags, goalIds }, this.opts)
      .pipe(map(r => r.task), catchError(this.handleError));
  }

  deleteTask(taskId: number): Observable<void> {
    return this.http
      .delete<void>(`/api/tasks/${taskId}`, this.opts)
      .pipe(catchError(this.handleError));
  }

  // ── Goals (not yet implemented) ────────────────────────────────────────────

  getGoalsForPeriod(_periodKey: string, _scope: GoalScope): Observable<Goal[]> {
    return of([]);
  }

  addGoal(_goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Observable<Goal> {
    return EMPTY;
  }

  updateGoal(_goal: Goal): Observable<Goal> {
    return EMPTY;
  }

  deleteGoal(_goalId: number): Observable<void> {
    return EMPTY;
  }

  // ── Tags ───────────────────────────────────────────────────────────────────

  getTags(): Observable<string[]> {
    return this.http
      .get<{ tags: string[] }>('/api/tags', this.opts)
      .pipe(map(r => r.tags), catchError(this.handleError));
  }

  addTag(tag: string): Observable<string[]> {
    return this.http
      .post<{ tags: string[] }>('/api/tags', { name: tag }, this.opts)
      .pipe(map(r => r.tags), catchError(this.handleError));
  }

  renameTag(oldTag: string, newTag: string): Observable<string[]> {
    return this.http
      .patch<{ tags: string[] }>(
        `/api/tags/${encodeURIComponent(oldTag)}`,
        { newName: newTag },
        this.opts
      )
      .pipe(map(r => r.tags), catchError(this.handleError));
  }

  deleteTag(tag: string): Observable<string[]> {
    return this.http
      .delete<{ tags: string[] }>(`/api/tags/${encodeURIComponent(tag)}`, this.opts)
      .pipe(map(r => r.tags), catchError(this.handleError));
  }

  // ── Error handling ─────────────────────────────────────────────────────────

  private handleError(err: HttpErrorResponse): Observable<never> {
    const message = err.error?.error ?? 'An unexpected error occurred';
    return throwError(() => new Error(message));
  }
}
