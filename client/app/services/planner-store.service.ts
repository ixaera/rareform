import { Injectable, signal, computed, inject } from '@angular/core';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Task, Goal } from '../models/task.interface';
import { PlannerDataService, GoalScope } from './planner-data.service';
import { PeriodService, PeriodScope } from './period.service';

const DEFAULT_TAGS = ['happy house', 'survive', 'strong body', 'sharp mind', 'create'];

@Injectable({ providedIn: 'root' })
export class PlannerStoreService {
  private dataService = inject(PlannerDataService);
  private periodService = inject(PeriodService);

  // === Navigation state ===
  readonly activeScope = signal<PeriodScope>('day');
  readonly periodOffsets = signal<Record<PeriodScope, number>>({
    day: 0, week: 0, quarter: 0, year: 0
  });

  readonly currentPeriodKeys = computed(() => {
    const offsets = this.periodOffsets();
    return {
      day: this.periodService.getPeriodKeyFromOffset(offsets.day, 'day'),
      week: this.periodService.getPeriodKeyFromOffset(offsets.week, 'week'),
      quarter: this.periodService.getPeriodKeyFromOffset(offsets.quarter, 'quarter'),
      year: this.periodService.getPeriodKeyFromOffset(offsets.year, 'year'),
    };
  });

  // === Data caches ===
  private taskCache = signal<Map<string, Task[]>>(new Map());
  private goalCache = signal<Map<string, Goal[]>>(new Map());
  private loadingKeys = signal<Set<string>>(new Set());

  // === Tags ===
  private readonly dbTags = signal<string[]>([]);
  private readonly dismissedDefaults = signal<string[]>([]);
  readonly globalTags = computed(() => {
    const real = this.dbTags();
    const dismissed = this.dismissedDefaults();
    const virtual = DEFAULT_TAGS.filter(d => !real.includes(d) && !dismissed.includes(d));
    return [...real, ...virtual];
  });

  // === Computed signals for current view ===
  readonly currentTasks = computed(() => {
    const dayKey = this.currentPeriodKeys().day;
    return this.taskCache().get(dayKey) ?? [];
  });

  readonly currentWeeklyGoals = computed(() => {
    const weekKey = this.currentPeriodKeys().week;
    return this.goalCache().get(`week:${weekKey}`) ?? [];
  });

  readonly currentQuarterlyGoals = computed(() => {
    const quarterKey = this.currentPeriodKeys().quarter;
    return this.goalCache().get(`quarter:${quarterKey}`) ?? [];
  });

  readonly currentYearlyGoals = computed(() => {
    const yearKey = this.currentPeriodKeys().year;
    return this.goalCache().get(`year:${yearKey}`) ?? [];
  });

  readonly isLoading = computed(() => this.loadingKeys().size > 0);

  readonly allCurrentGoals = computed(() => [
    ...this.currentWeeklyGoals(),
    ...this.currentQuarterlyGoals(),
    ...this.currentYearlyGoals(),
  ]);

  readonly currentQuarterAndYearGoals = computed(() => [
    ...this.currentQuarterlyGoals(),
    ...this.currentYearlyGoals(),
  ]);

  // === Initialization ===

  initialize(): void {
    const keys = this.currentPeriodKeys();

    // Load tasks and tags independently so a failure in one doesn't block the other
    this.loadTasks(keys.day);
    this.dataService.getTags().subscribe({
      next: tags => this.dbTags.set(tags),
      error: () => {}
    });

    // Goals not yet implemented — seed caches with empty arrays immediately
    this.setGoalCache('week', keys.week, []);
    this.setGoalCache('quarter', keys.quarter, []);
    this.setGoalCache('year', keys.year, []);

    // Prefetch adjacent periods (loadTasks deduplicates via loadingKeys)
    this.prefetchAdjacentPeriods();
  }

  // === Navigation ===

  setActiveScope(scope: PeriodScope): void {
    this.activeScope.set(scope);

    this.periodOffsets.update(offsets => {
      const updated = { ...offsets };
      if (scope === 'day') {
        this.applySyncWeekToDay(updated);
      } else if (scope === 'week') {
        this.applySyncDayToWeek(updated);
      } else if (scope === 'quarter') {
        this.applySyncYearToQuarter(updated);
      }
      return updated;
    });

    this.ensureCurrentPeriodLoaded();
    this.prefetchAdjacentPeriods();
  }

  navigatePeriod(direction: number): void {
    const scope = this.activeScope();

    this.periodOffsets.update(offsets => {
      const updated = { ...offsets };
      updated[scope] += direction;

      if (scope === 'day') {
        this.applySyncWeekToDay(updated);
      } else if (scope === 'week') {
        this.applySyncDayToWeek(updated);
      } else if (scope === 'quarter') {
        this.applySyncYearToQuarter(updated);
      }

      return updated;
    });

    this.ensureCurrentPeriodLoaded();
    this.prefetchAdjacentPeriods();
  }

  jumpToToday(): void {
    this.periodOffsets.set({ day: 0, week: 0, quarter: 0, year: 0 });
    this.ensureCurrentPeriodLoaded();
    this.prefetchAdjacentPeriods();
  }

  // === Task CRUD ===

  addTask(text: string): void {
    const dateKey = this.currentPeriodKeys().day;
    this.dataService.addTask({ text, completed: false, tags: [], goalIds: [], date: dateKey }).subscribe(task => {
      this.updateTaskCacheEntry(dateKey, tasks => [...tasks, task]);
    });
  }

  updateTask(task: Task): void {
    // Optimistic update: apply change locally before server confirms
    this.updateTaskCacheEntry(task.date, tasks =>
      tasks.map(t => t.id === task.id ? task : t)
    );
    this.dataService.updateTask(task).subscribe({
      next: updated => {
        // Reconcile with server-authoritative response (updatedAt etc.)
        this.updateTaskCacheEntry(updated.date, tasks =>
          tasks.map(t => t.id === updated.id ? updated : t)
        );
      },
      error: () => {}
    });
  }

  deleteTask(taskId: number): void {
    const dateKey = this.currentPeriodKeys().day;
    this.dataService.deleteTask(taskId).subscribe(() => {
      this.updateTaskCacheEntry(dateKey, tasks => tasks.filter(t => t.id !== taskId));
    });
  }

  toggleTaskCompletion(taskId: number): void {
    const dateKey = this.currentPeriodKeys().day;
    const tasks = this.taskCache().get(dateKey) ?? [];
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      this.updateTask({ ...task, completed: !task.completed });
    }
  }

  // === Goal CRUD ===

  addGoal(text: string, scope: GoalScope): void {
    const periodKey = this.currentPeriodKeys()[scope];
    this.dataService.addGoal({ text, completed: false, tags: [], goalIds: [], scope, periodKey }).subscribe(goal => {
      this.updateGoalCacheEntry(scope, periodKey, goals => [...goals, goal]);
    });
  }

  updateGoal(goal: Goal): void {
    this.dataService.updateGoal(goal).subscribe(updated => {
      this.updateGoalCacheEntry(updated.scope as GoalScope, updated.periodKey!, goals =>
        goals.map(g => g.id === updated.id ? updated : g)
      );
    });
  }

  deleteGoal(goalId: number, scope: GoalScope): void {
    const periodKey = this.currentPeriodKeys()[scope];
    this.dataService.deleteGoal(goalId).subscribe(() => {
      this.updateGoalCacheEntry(scope, periodKey, goals => goals.filter(g => g.id !== goalId));
    });
  }

  toggleGoalCompletion(goalId: number, scope: GoalScope): void {
    const periodKey = this.currentPeriodKeys()[scope];
    const cacheKey = `${scope}:${periodKey}`;
    const goals = this.goalCache().get(cacheKey) ?? [];
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      this.updateGoal({ ...goal, completed: !goal.completed });
    }
  }

  // === Tag CRUD ===

  addTaskTag(taskId: number, tag: string): void {
    const dateKey = this.currentPeriodKeys().day;
    const task = (this.taskCache().get(dateKey) ?? []).find(t => t.id === taskId);
    if (!task || task.tags.length >= 5 || task.tags.includes(tag)) return;

    const updatedTask = { ...task, tags: [...task.tags, tag] };

    // Optimistic: show tag immediately
    this.updateTaskCacheEntry(dateKey, tasks =>
      tasks.map(t => t.id === taskId ? updatedTask : t)
    );

    // Materialize virtual tag if needed, then persist to server
    const materialize$ = this.dbTags().includes(tag)
      ? of([] as string[])
      : this.dataService.addTag(tag).pipe(tap(tags => this.dbTags.set(tags)));

    materialize$.subscribe(() => this.updateTask(updatedTask));
  }

  removeTaskTag(taskId: number, tagIndex: number): void {
    this.updateTaskTags(taskId, tags => tags.filter((_, i) => i !== tagIndex));
  }

  linkGoalToTask(taskId: number, goalId: number): void {
    this.updateTaskGoals(taskId, ids =>
      ids.includes(goalId) ? null : [...ids, goalId]
    );
  }

  unlinkGoalFromTask(taskId: number, goalId: number): void {
    this.updateTaskGoals(taskId, ids => ids.filter(id => id !== goalId));
  }

  addGoalTag(goalId: number, scope: GoalScope, tag: string): void {
    const periodKey = this.currentPeriodKeys()[scope];
    const goal = (this.goalCache().get(`${scope}:${periodKey}`) ?? []).find(g => g.id === goalId);
    if (!goal || goal.tags.length >= 5 || goal.tags.includes(tag)) return;

    const updatedGoal = { ...goal, tags: [...goal.tags, tag] };

    // Optimistic: show tag immediately
    this.updateGoalCacheEntry(scope, periodKey, goals =>
      goals.map(g => g.id === goalId ? updatedGoal : g)
    );

    // Materialize virtual tag if needed, then persist to server
    const materialize$ = this.dbTags().includes(tag)
      ? of([] as string[])
      : this.dataService.addTag(tag).pipe(tap(tags => this.dbTags.set(tags)));

    materialize$.subscribe(() => this.updateGoal(updatedGoal));
  }

  removeGoalTag(goalId: number, scope: GoalScope, tagIndex: number): void {
    this.updateGoalTags(goalId, scope, tags => tags.filter((_, i) => i !== tagIndex));
  }

  private updateTaskTags(taskId: number, updater: (tags: string[]) => string[] | null): void {
    const dateKey = this.currentPeriodKeys().day;
    const task = (this.taskCache().get(dateKey) ?? []).find(t => t.id === taskId);
    if (!task) return;
    const newTags = updater(task.tags);
    if (newTags !== null) this.updateTask({ ...task, tags: newTags });
  }

  private updateGoalTags(goalId: number, scope: GoalScope, updater: (tags: string[]) => string[] | null): void {
    const periodKey = this.currentPeriodKeys()[scope];
    const goal = (this.goalCache().get(`${scope}:${periodKey}`) ?? []).find(g => g.id === goalId);
    if (!goal) return;
    const newTags = updater(goal.tags);
    if (newTags !== null) this.updateGoal({ ...goal, tags: newTags });
  }

  private updateTaskGoals(taskId: number, updater: (ids: number[]) => number[] | null): void {
    const dateKey = this.currentPeriodKeys().day;
    const task = (this.taskCache().get(dateKey) ?? []).find(t => t.id === taskId);
    if (!task) return;
    const newIds = updater(task.goalIds ?? []);
    if (newIds !== null) this.updateTask({ ...task, goalIds: newIds });
  }

  linkGoalToGoal(goalId: number, targetGoalId: number, scope: GoalScope): void {
    this.updateGoalGoals(goalId, scope, ids =>
      ids.includes(targetGoalId) ? null : [...ids, targetGoalId]
    );
  }

  unlinkGoalFromGoal(goalId: number, targetGoalId: number, scope: GoalScope): void {
    this.updateGoalGoals(goalId, scope, ids => ids.filter(id => id !== targetGoalId));
  }

  private updateGoalGoals(goalId: number, scope: GoalScope, updater: (ids: number[]) => number[] | null): void {
    const periodKey = this.currentPeriodKeys()[scope];
    const goal = (this.goalCache().get(`${scope}:${periodKey}`) ?? []).find(g => g.id === goalId);
    if (!goal) return;
    const newIds = updater(goal.goalIds ?? []);
    if (newIds !== null) this.updateGoal({ ...goal, goalIds: newIds });
  }

  // === Global Tag Operations ===

  addGlobalTag(tag: string): void {
    this.dataService.addTag(tag).subscribe(tags => this.dbTags.set(tags));
  }

  renameGlobalTag(oldTag: string, newTag: string): void {
    if (this.dbTags().includes(oldTag)) {
      this.dataService.renameTag(oldTag, newTag).subscribe(tags => {
        this.dbTags.set(tags);
        this.refreshAllCaches();
      });
    } else {
      // Virtual default: persist only the new name; old default auto-drops from computed
      this.dataService.addTag(newTag).subscribe(tags => this.dbTags.set(tags));
    }
  }

  deleteGlobalTag(tag: string): void {
    if (this.dbTags().includes(tag)) {
      this.dataService.deleteTag(tag).subscribe(tags => {
        this.dbTags.set(tags);
        this.refreshAllCaches();
      });
    } else {
      // Virtual default: dismiss client-side only, no DB call needed
      this.dismissedDefaults.update(d => [...d, tag]);
    }
  }

  // === Period Label Helpers ===

  getDayLabel(): string {
    return this.periodService.formatPeriodLabel(this.currentPeriodKeys().day, 'day');
  }

  getWeekLabel(): string {
    return this.periodService.formatPeriodLabel(this.currentPeriodKeys().week, 'week');
  }

  getQuarterLabel(): string {
    return this.periodService.formatPeriodLabel(this.currentPeriodKeys().quarter, 'quarter');
  }

  getYearLabel(): string {
    return this.periodService.formatPeriodLabel(this.currentPeriodKeys().year, 'year');
  }

  getCurrentPeriodLabel(): string {
    const keys = this.currentPeriodKeys();
    const scope = this.activeScope();
    return this.periodService.formatPeriodLabel(keys[scope], scope);
  }

  isAtCurrentPeriod(scope: PeriodScope): boolean {
    return this.periodOffsets()[scope] === 0;
  }

  isPastPeriod(): boolean {
    return this.periodOffsets()[this.activeScope()] < 0;
  }

  isFuturePeriod(): boolean {
    return this.periodOffsets()[this.activeScope()] > 0;
  }

  // === Private: Cache Management ===

  private setTaskCache(dateKey: string, tasks: Task[]): void {
    this.taskCache.update(cache => {
      const updated = new Map(cache);
      updated.set(dateKey, tasks);
      return updated;
    });
  }

  private setGoalCache(scope: GoalScope, periodKey: string, goals: Goal[]): void {
    this.goalCache.update(cache => {
      const updated = new Map(cache);
      updated.set(`${scope}:${periodKey}`, goals);
      return updated;
    });
  }

  private updateTaskCacheEntry(dateKey: string, updater: (tasks: Task[]) => Task[]): void {
    this.taskCache.update(cache => {
      const updated = new Map(cache);
      const current = updated.get(dateKey) ?? [];
      updated.set(dateKey, updater(current));
      return updated;
    });
  }

  private updateGoalCacheEntry(scope: GoalScope, periodKey: string, updater: (goals: Goal[]) => Goal[]): void {
    this.goalCache.update(cache => {
      const updated = new Map(cache);
      const key = `${scope}:${periodKey}`;
      const current = updated.get(key) ?? [];
      updated.set(key, updater(current));
      return updated;
    });
  }

  private isTaskCached(dateKey: string): boolean {
    return this.taskCache().has(dateKey);
  }

  private isGoalCached(scope: GoalScope, periodKey: string): boolean {
    return this.goalCache().has(`${scope}:${periodKey}`);
  }

  // === Private: Data Loading ===

  private ensureCurrentPeriodLoaded(): void {
    const keys = this.currentPeriodKeys();

    if (!this.isTaskCached(keys.day)) {
      this.loadTasks(keys.day);
    }
    if (!this.isGoalCached('week', keys.week)) {
      this.loadGoals('week', keys.week);
    }
    if (!this.isGoalCached('quarter', keys.quarter)) {
      this.loadGoals('quarter', keys.quarter);
    }
    if (!this.isGoalCached('year', keys.year)) {
      this.loadGoals('year', keys.year);
    }
  }

  private loadTasks(dateKey: string): void {
    const loadKey = `tasks:${dateKey}`;
    if (this.loadingKeys().has(loadKey)) return;

    this.addLoadingKey(loadKey);
    this.dataService.getTasksForDay(dateKey).subscribe(tasks => {
      this.setTaskCache(dateKey, tasks);
      this.removeLoadingKey(loadKey);
    });
  }

  private loadGoals(scope: GoalScope, periodKey: string): void {
    const loadKey = `goals:${scope}:${periodKey}`;
    if (this.loadingKeys().has(loadKey)) return;

    this.addLoadingKey(loadKey);
    this.dataService.getGoalsForPeriod(periodKey, scope).subscribe(goals => {
      this.setGoalCache(scope, periodKey, goals);
      this.removeLoadingKey(loadKey);
    });
  }

  private addLoadingKey(key: string): void {
    this.loadingKeys.update(keys => {
      const updated = new Set(keys);
      updated.add(key);
      return updated;
    });
  }

  private removeLoadingKey(key: string): void {
    this.loadingKeys.update(keys => {
      const updated = new Set(keys);
      updated.delete(key);
      return updated;
    });
  }

  // === Private: Prefetching ===

  private prefetchAdjacentPeriods(): void {
    const keys = this.currentPeriodKeys();

    // Prefetch prev/next day
    const prevDay = this.periodService.getPrevPeriod(keys.day, 'day');
    const nextDay = this.periodService.getNextPeriod(keys.day, 'day');
    if (!this.isTaskCached(prevDay)) this.loadTasks(prevDay);
    if (!this.isTaskCached(nextDay)) this.loadTasks(nextDay);

    // Prefetch prev/next week goals
    const prevWeek = this.periodService.getPrevPeriod(keys.week, 'week');
    const nextWeek = this.periodService.getNextPeriod(keys.week, 'week');
    if (!this.isGoalCached('week', prevWeek)) this.loadGoals('week', prevWeek);
    if (!this.isGoalCached('week', nextWeek)) this.loadGoals('week', nextWeek);

    // Prefetch all days of the current week
    const weekDayKeys = this.periodService.getDayKeysForWeek(keys.week);
    for (const dayKey of weekDayKeys) {
      if (!this.isTaskCached(dayKey)) this.loadTasks(dayKey);
    }

    // Prefetch prev/next quarter goals
    const prevQ = this.periodService.getPrevPeriod(keys.quarter, 'quarter');
    const nextQ = this.periodService.getNextPeriod(keys.quarter, 'quarter');
    if (!this.isGoalCached('quarter', prevQ)) this.loadGoals('quarter', prevQ);
    if (!this.isGoalCached('quarter', nextQ)) this.loadGoals('quarter', nextQ);

    // Prefetch prev/next year goals
    const prevY = this.periodService.getPrevPeriod(keys.year, 'year');
    const nextY = this.periodService.getNextPeriod(keys.year, 'year');
    if (!this.isGoalCached('year', prevY)) this.loadGoals('year', prevY);
    if (!this.isGoalCached('year', nextY)) this.loadGoals('year', nextY);
  }

  // === Private: Day/Week Sync ===

  /** Mutates the offsets object in-place: sets week offset to match current day */
  private applySyncWeekToDay(offsets: Record<PeriodScope, number>): void {
    const dayKey = this.periodService.getPeriodKeyFromOffset(offsets.day, 'day');
    offsets.week = this.periodService.getWeekOffsetForDateKey(dayKey);
  }

  /** Mutates the offsets object in-place: sets day offset to Monday of current week */
  private applySyncDayToWeek(offsets: Record<PeriodScope, number>): void {
    const weekKey = this.periodService.getPeriodKeyFromOffset(offsets.week, 'week');
    const mondayKey = this.periodService.getMondayForWeek(weekKey);
    offsets.day = this.periodService.getDayOffsetForDateKey(mondayKey);
  }

  /** Mutates the offsets object in-place: sets year offset to match current quarter's year */
  private applySyncYearToQuarter(offsets: Record<PeriodScope, number>): void {
    const quarterKey = this.periodService.getPeriodKeyFromOffset(offsets.quarter, 'quarter');
    offsets.year = this.periodService.getYearOffsetForQuarterKey(quarterKey);
  }

  // === Private: Refresh Caches ===

  private refreshAllCaches(): void {
    // Re-fetch all cached periods from data service to pick up tag changes
    for (const dateKey of this.taskCache().keys()) {
      this.dataService.getTasksForDay(dateKey).subscribe(tasks => {
        this.setTaskCache(dateKey, tasks);
      });
    }
    for (const cacheKey of this.goalCache().keys()) {
      const [scope, periodKey] = cacheKey.split(':') as [GoalScope, string];
      this.dataService.getGoalsForPeriod(periodKey, scope).subscribe(goals => {
        this.setGoalCache(scope, periodKey, goals);
      });
    }
  }
}
