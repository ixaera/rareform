import { Component, HostListener, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, Goal } from '../../models/task.interface';
import { PlannerStoreService } from '../../services/planner-store.service';
import { PeriodService } from '../../services/period.service';

@Component({
  selector: 'app-daily-tasks',
  imports: [CommonModule, FormsModule],
  templateUrl: './daily-tasks.html',
  styleUrl: './daily-tasks.css'
})
export class DailyTasksComponent {
  private store = inject(PlannerStoreService);
  private periodService = inject(PeriodService);

  @Input() tasks: Task[] = [];
  @Input() availableTags: string[] = [];
  @Input() allGoals: Goal[] = [];
  @Input() currentDate: string = '';
  @Input() isPast: boolean = false;
  @Input() isFuture: boolean = false;

  newTask = '';
  newTaskTagInput: { [taskId: number]: string } = {};
  showTagDropdown: { [taskId: number]: boolean } = {};
  tagInputVisible: { [taskId: number]: boolean } = {};

  goalInputVisible: { [taskId: number]: boolean } = {};
  showGoalDropdown: { [taskId: number]: boolean } = {};
  newGoalInput: { [taskId: number]: string } = {};

  addTask(): void {
    if (this.newTask.trim()) {
      this.store.addTask(this.newTask.trim());
      this.newTask = '';
    }
  }

  toggleCompletion(task: Task): void {
    this.store.toggleTaskCompletion(task.id);
  }

  showTaskTagInput(taskId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    // Close other tag inputs
    for (const id of Object.keys(this.tagInputVisible)) {
      const numId = Number(id);
      if (numId !== taskId && this.tagInputVisible[numId]) {
        this.tagInputVisible[numId] = false;
        this.newTaskTagInput[numId] = '';
        this.showTagDropdown[numId] = false;
      }
    }
    this.tagInputVisible[taskId] = true;
    this.showTagDropdown[taskId] = true;
  }

  getFilteredTags(taskId: number): string[] {
    const task = this.tasks.find(t => t.id === taskId);
    const searchTerm = this.newTaskTagInput[taskId]?.toLowerCase() || '';
    const taskTags = task?.tags || [];

    return this.availableTags.filter(tag =>
      !taskTags.includes(tag) &&
      tag.toLowerCase().includes(searchTerm)
    );
  }

  selectTag(taskId: number, tag: string): void {
    this.store.addTaskTag(taskId, tag);
    this.newTaskTagInput[taskId] = '';
    this.showTagDropdown[taskId] = false;
  }

  onTagInputFocus(taskId: number): void {
    this.showTagDropdown[taskId] = true;
  }

  onTagInputChange(taskId: number): void {
    this.showTagDropdown[taskId] = true;
  }

  addTagToTask(taskId: number): void {
    const filteredTags = this.getFilteredTags(taskId);
    if (filteredTags.length > 0) {
      this.selectTag(taskId, filteredTags[0]);
    }
  }

  removeTaskTag(taskId: number, tagIndex: number): void {
    this.store.removeTaskTag(taskId, tagIndex);
  }

  showGoalPicker(taskId: number, event?: Event): void {
    if (event) event.stopPropagation();
    for (const id of Object.keys(this.goalInputVisible)) {
      const numId = Number(id);
      if (numId !== taskId && this.goalInputVisible[numId]) {
        this.goalInputVisible[numId] = false;
        this.newGoalInput[numId] = '';
        this.showGoalDropdown[numId] = false;
      }
    }
    this.goalInputVisible[taskId] = !this.goalInputVisible[taskId];
    if (this.goalInputVisible[taskId]) {
      this.showGoalDropdown[taskId] = true;
    }
  }

  getFilteredGoals(taskId: number): Goal[] {
    const task = this.tasks.find(t => t.id === taskId);
    const linkedIds = task?.goalIds ?? [];
    const searchTerm = this.newGoalInput[taskId]?.toLowerCase() || '';
    return this.allGoals.filter(g =>
      !linkedIds.includes(g.id) &&
      g.text.toLowerCase().includes(searchTerm)
    );
  }

  getLinkedGoals(task: Task): Goal[] {
    const ids = task.goalIds ?? [];
    return ids.map(id => this.allGoals.find(g => g.id === id)).filter((g): g is Goal => !!g);
  }

  selectGoal(taskId: number, goalId: number): void {
    this.store.linkGoalToTask(taskId, goalId);
    this.newGoalInput[taskId] = '';
    this.showGoalDropdown[taskId] = false;
  }

  unlinkGoal(taskId: number, goalId: number): void {
    this.store.unlinkGoalFromTask(taskId, goalId);
  }

  scopeLabel(scope: string): string {
    return scope === 'week' ? 'W' : scope === 'quarter' ? 'Q' : 'Y';
  }

  @HostListener('document:click')
  closeAllDropdowns(): void {
    for (const id of Object.keys(this.tagInputVisible)) {
      const numId = Number(id);
      this.tagInputVisible[numId] = false;
      this.showTagDropdown[numId] = false;
      this.newTaskTagInput[numId] = '';
    }
    for (const id of Object.keys(this.goalInputVisible)) {
      const numId = Number(id);
      this.goalInputVisible[numId] = false;
      this.showGoalDropdown[numId] = false;
      this.newGoalInput[numId] = '';
    }
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  closeAllTagInputs(): void {
    for (const id of Object.keys(this.tagInputVisible)) {
      this.tagInputVisible[Number(id)] = false;
    }
  }

  getDayTitle(): string {
    if (!this.currentDate) return 'Today';
    return this.periodService.formatPeriodLabel(this.currentDate, 'day');
  }
}
