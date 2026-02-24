import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Task, Goal } from '../models/task.interface';
import { PlannerDataService, GoalScope } from './planner-data.service';
import { PeriodService } from './period.service';

@Injectable()
export class MockPlannerDataService extends PlannerDataService {
  private periodService = inject(PeriodService);

  // In-memory storage keyed by period
  private tasksByDate = new Map<string, Task[]>();
  private goalsByPeriod = new Map<string, Goal[]>(); // key: "week:2026-W08"
  private tags: string[] = ['happy house', 'survive', 'strong body', 'sharp mind', 'create'];

  // Track which periods have been initialized with mock data
  private initializedPeriods = new Set<string>();

  private nextId = 1000;

  private sampleTaskTexts = [
    'Review quarterly performance metrics',
    'Schedule team sync meeting',
    'Update project documentation',
    'Complete code review for PR',
    'Prepare presentation slides',
    'Follow up with stakeholders',
    'Refactor authentication module',
    'Write unit tests for new features',
    'Review and approve budget proposal',
    'Organize team knowledge sharing session'
  ];

  private sampleGoalTexts: Record<GoalScope, string[]> = {
    week: [
      'Complete all sprint tasks',
      'Review team performance',
      'Ship new feature to production',
      'Reduce technical debt by 10%',
      'Improve code coverage'
    ],
    quarter: [
      'Launch v2.0 product release',
      'Hire 3 new team members',
      'Implement new CI/CD pipeline',
      'Achieve 95% customer satisfaction',
      'Complete platform migration'
    ],
    year: [
      'Double user base',
      'Expand to 5 new markets',
      'Achieve profitability',
      'Build world-class engineering team',
      'Establish thought leadership'
    ]
  };

  // Hard-coded "current period" seed data — shown for today / this week / this quarter / this year
  private seedTasks: Omit<Task, 'date' | 'createdAt' | 'updatedAt'>[] = [
    { id: 1, text: 'Review Q1 strategy documents and prepare feedback', completed: false, tags: [] },
    { id: 2, text: 'Schedule team standup for Tuesday morning', completed: true, tags: [] },
    { id: 3, text: 'Update project timeline in tracking system', completed: false, tags: [] },
    { id: 4, text: 'Respond to client emails and schedule follow-up calls', completed: false, tags: [] },
    { id: 5, text: 'Complete code review for PR #245', completed: true, tags: [] },
    { id: 6, text: 'Prepare slides for Wednesday presentation', completed: false, tags: [] }
  ];

  private seedWeeklyGoals: Omit<Goal, 'scope' | 'periodKey' | 'createdAt' | 'updatedAt'>[] = [
    { id: 101, text: 'Ship feature X to production', completed: false, tags: [] },
    { id: 102, text: 'Complete 3 code reviews', completed: true, tags: [] },
    { id: 103, text: 'Finalize Q1 roadmap', completed: false, tags: [] },
    { id: 104, text: 'Reduce technical debt by 20%', completed: false, tags: [] },
    { id: 105, text: 'Improve test coverage to 85%', completed: false, tags: [] }
  ];

  private seedQuarterlyGoals: Omit<Goal, 'scope' | 'periodKey' | 'createdAt' | 'updatedAt'>[] = [
    { id: 201, text: 'Complete product roadmap for Q1', completed: false, tags: [] },
    { id: 202, text: 'Hire 3 engineers', completed: false, tags: [] },
    { id: 203, text: 'Reach 10k monthly active users', completed: true, tags: [] },
    { id: 204, text: 'Implement analytics dashboard', completed: false, tags: [] },
    { id: 205, text: 'Launch beta testing program', completed: false, tags: [] }
  ];

  private seedYearlyGoals: Omit<Goal, 'scope' | 'periodKey' | 'createdAt' | 'updatedAt'>[] = [
    { id: 301, text: 'Launch 3 major product features', completed: false, tags: [] },
    { id: 302, text: 'Grow user base by 50%', completed: false, tags: [] },
    { id: 303, text: 'Achieve $1M ARR', completed: false, tags: [] },
    { id: 304, text: 'Build and scale engineering team to 10 people', completed: false, tags: [] },
    { id: 305, text: 'Establish thought leadership with 12 blog posts', completed: false, tags: [] }
  ];

  constructor() {
    super();
    this.seedCurrentPeriodData();
    this.seedHistoricalData(4);
  }

  // === Data Fetching ===

  getTasksForDay(dateKey: string): Observable<Task[]> {
    this.ensureDayInitialized(dateKey);
    const tasks = this.tasksByDate.get(dateKey) ?? [];
    return of([...tasks]);
  }

  getGoalsForPeriod(periodKey: string, scope: GoalScope): Observable<Goal[]> {
    this.ensureGoalPeriodInitialized(periodKey, scope);
    const key = `${scope}:${periodKey}`;
    const goals = this.goalsByPeriod.get(key) ?? [];
    return of([...goals]);
  }

  // === Task CRUD ===

  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Observable<Task> {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: this.nextId++,
      createdAt: now,
      updatedAt: now
    };
    const dateKey = newTask.date!;
    const tasks = this.tasksByDate.get(dateKey) ?? [];
    tasks.push(newTask);
    this.tasksByDate.set(dateKey, tasks);
    return of({ ...newTask });
  }

  updateTask(task: Task): Observable<Task> {
    const dateKey = task.date!;
    const tasks = this.tasksByDate.get(dateKey);
    if (tasks) {
      const index = tasks.findIndex(t => t.id === task.id);
      if (index !== -1) {
        task.updatedAt = new Date().toISOString();
        tasks[index] = { ...task };
      }
    }
    return of({ ...task });
  }

  deleteTask(taskId: number): Observable<void> {
    for (const [dateKey, tasks] of this.tasksByDate) {
      const index = tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        tasks.splice(index, 1);
        break;
      }
    }
    return of(undefined);
  }

  // === Goal CRUD ===

  addGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Observable<Goal> {
    const now = new Date().toISOString();
    const newGoal: Goal = {
      ...goal,
      id: this.nextId++,
      createdAt: now,
      updatedAt: now
    };
    const key = `${newGoal.scope}:${newGoal.periodKey}`;
    const goals = this.goalsByPeriod.get(key) ?? [];
    goals.push(newGoal);
    this.goalsByPeriod.set(key, goals);
    return of({ ...newGoal });
  }

  updateGoal(goal: Goal): Observable<Goal> {
    const key = `${goal.scope}:${goal.periodKey}`;
    const goals = this.goalsByPeriod.get(key);
    if (goals) {
      const index = goals.findIndex(g => g.id === goal.id);
      if (index !== -1) {
        goal.updatedAt = new Date().toISOString();
        goals[index] = { ...goal };
      }
    }
    return of({ ...goal });
  }

  deleteGoal(goalId: number): Observable<void> {
    for (const [key, goals] of this.goalsByPeriod) {
      const index = goals.findIndex(g => g.id === goalId);
      if (index !== -1) {
        goals.splice(index, 1);
        break;
      }
    }
    return of(undefined);
  }

  // === Tag Operations ===

  getTags(): Observable<string[]> {
    return of([...this.tags]);
  }

  addTag(tag: string): Observable<string[]> {
    if (tag && tag.length <= 15 && !this.tags.includes(tag)) {
      this.tags.push(tag);
    }
    return of([...this.tags]);
  }

  renameTag(oldTag: string, newTag: string): Observable<string[]> {
    const index = this.tags.indexOf(oldTag);
    if (index !== -1) {
      this.tags[index] = newTag;
    }

    // Rename across all tasks and goals
    for (const tasks of this.tasksByDate.values()) {
      for (const task of tasks) {
        if (task.tags) {
          const tagIdx = task.tags.indexOf(oldTag);
          if (tagIdx !== -1) task.tags[tagIdx] = newTag;
        }
      }
    }
    for (const goals of this.goalsByPeriod.values()) {
      for (const goal of goals) {
        if (goal.tags) {
          const tagIdx = goal.tags.indexOf(oldTag);
          if (tagIdx !== -1) goal.tags[tagIdx] = newTag;
        }
      }
    }

    return of([...this.tags]);
  }

  deleteTag(tag: string): Observable<string[]> {
    this.tags = this.tags.filter(t => t !== tag);

    // Remove from all tasks and goals
    for (const tasks of this.tasksByDate.values()) {
      for (const task of tasks) {
        if (task.tags) {
          task.tags = task.tags.filter(t => t !== tag);
        }
      }
    }
    for (const goals of this.goalsByPeriod.values()) {
      for (const goal of goals) {
        if (goal.tags) {
          goal.tags = goal.tags.filter(t => t !== tag);
        }
      }
    }

    return of([...this.tags]);
  }

  // === Private: Data Generation ===

  private seedCurrentPeriodData(): void {
    const todayKey = this.periodService.getCurrentPeriodKey('day');
    const weekKey = this.periodService.getCurrentPeriodKey('week');
    const quarterKey = this.periodService.getCurrentPeriodKey('quarter');
    const yearKey = this.periodService.getCurrentPeriodKey('year');
    const now = new Date().toISOString();

    // Seed today's tasks
    const tasks: Task[] = this.seedTasks.map(t => ({
      ...t,
      date: todayKey,
      createdAt: now,
      updatedAt: now
    }));
    this.tasksByDate.set(todayKey, tasks);
    this.initializedPeriods.add(`day:${todayKey}`);

    // Seed current week goals
    const weeklyGoals: Goal[] = this.seedWeeklyGoals.map(g => ({
      ...g,
      scope: 'week' as const,
      periodKey: weekKey,
      createdAt: now,
      updatedAt: now
    }));
    this.goalsByPeriod.set(`week:${weekKey}`, weeklyGoals);
    this.initializedPeriods.add(`week:${weekKey}`);

    // Seed current quarter goals
    const quarterlyGoals: Goal[] = this.seedQuarterlyGoals.map(g => ({
      ...g,
      scope: 'quarter' as const,
      periodKey: quarterKey,
      createdAt: now,
      updatedAt: now
    }));
    this.goalsByPeriod.set(`quarter:${quarterKey}`, quarterlyGoals);
    this.initializedPeriods.add(`quarter:${quarterKey}`);

    // Seed current year goals
    const yearlyGoals: Goal[] = this.seedYearlyGoals.map(g => ({
      ...g,
      scope: 'year' as const,
      periodKey: yearKey,
      createdAt: now,
      updatedAt: now
    }));
    this.goalsByPeriod.set(`year:${yearKey}`, yearlyGoals);
    this.initializedPeriods.add(`year:${yearKey}`);
  }

  private seedHistoricalData(weeksBack: number): void {
    for (let weekOffset = -weeksBack; weekOffset < 0; weekOffset++) {
      const weekKey = this.periodService.getPeriodKeyFromOffset(weekOffset, 'week');
      const weekStart = this.periodService.getWeekStartDate(weekKey);

      // Generate tasks for each day of the week
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + dayOffset);
        const dateKey = date.toISOString().split('T')[0];

        if (!this.initializedPeriods.has(`day:${dateKey}`)) {
          const count = 3 + Math.floor(Math.random() * 3);
          this.tasksByDate.set(dateKey, this.generateTasksForDate(dateKey, count));
          this.initializedPeriods.add(`day:${dateKey}`);
        }
      }

      // Generate weekly goals
      if (!this.initializedPeriods.has(`week:${weekKey}`)) {
        const count = 2 + Math.floor(Math.random() * 3);
        this.goalsByPeriod.set(`week:${weekKey}`, this.generateGoalsForPeriod('week', weekKey, count));
        this.initializedPeriods.add(`week:${weekKey}`);
      }
    }
  }

  private ensureDayInitialized(dateKey: string): void {
    const key = `day:${dateKey}`;
    if (!this.initializedPeriods.has(key)) {
      const isPast = new Date(dateKey) < new Date(new Date().toISOString().split('T')[0]);
      const count = isPast ? 3 + Math.floor(Math.random() * 3) : 0;
      this.tasksByDate.set(dateKey, count > 0 ? this.generateTasksForDate(dateKey, count) : []);
      this.initializedPeriods.add(key);
    }
  }

  private ensureGoalPeriodInitialized(periodKey: string, scope: GoalScope): void {
    const key = `${scope}:${periodKey}`;
    if (!this.initializedPeriods.has(key)) {
      const isPast = this.periodService.isPastPeriod(periodKey, scope);
      const count = isPast ? 2 + Math.floor(Math.random() * 3) : 0;
      this.goalsByPeriod.set(key, count > 0 ? this.generateGoalsForPeriod(scope, periodKey, count) : []);
      this.initializedPeriods.add(key);
    }
  }

  private generateTasksForDate(dateKey: string, count: number): Task[] {
    const tasks: Task[] = [];
    const isPast = new Date(dateKey) < new Date(new Date().toISOString().split('T')[0]);

    for (let i = 0; i < count; i++) {
      const text = this.sampleTaskTexts[Math.floor(Math.random() * this.sampleTaskTexts.length)];
      tasks.push({
        id: this.nextId++,
        text,
        completed: isPast ? Math.random() > 0.3 : false,
        tags: [],
        date: dateKey,
        createdAt: new Date(dateKey).toISOString(),
        updatedAt: new Date(dateKey).toISOString()
      });
    }
    return tasks;
  }

  private generateGoalsForPeriod(scope: GoalScope, periodKey: string, count: number): Goal[] {
    const goals: Goal[] = [];
    const isPast = this.periodService.isPastPeriod(periodKey, scope);
    const goalTexts = this.sampleGoalTexts[scope];

    for (let i = 0; i < Math.min(count, goalTexts.length); i++) {
      goals.push({
        id: this.nextId++,
        text: goalTexts[i],
        completed: isPast ? Math.random() > 0.4 : false,
        tags: [],
        scope,
        periodKey,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    return goals;
  }
}
