import { Component, HostListener, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Goal } from '../../models/task.interface';
import { PlannerStoreService } from '../../services/planner-store.service';
import { PeriodService, PeriodScope } from '../../services/period.service';
import { GoalScope } from '../../services/planner-data.service';
import { TagInputState } from '../tag-input-state';

interface ScopeStyle {
  container: string;
  header: string;
  addSection: string;
  addWrapper: string;
  addInput: string;
  addButton: string;
  goalRow: string;
  item: string;
  checkbox: string;
  label: string;
  labelActive: string;
  tagBtnBase: string;
  tagBtnActive: string;
  tagBtnInactive: string;
  tagBtnIcon: string;
  tagsWrapper: string;
  tagBadge: string;
  tagRemove: string;
  tagIcon: string;
  tagInputArea: string;
  tagInput: string;
  tagDropdown: string;
  tagDropdownOption: string;
  tagCount: string;
  idPrefix: string;
}

const SCOPE_STYLES: Record<GoalScope, ScopeStyle> = {
  week: {
    container: 'bg-white border-2 border-violet-300 rounded-lg shadow-xl p-6 h-full',
    header: 'text-2xl font-bold text-violet-950 mb-6 pb-3 border-b-2 border-indigo-200',
    addSection: 'mb-4',
    addWrapper: 'flex flex-col gap-2',
    addInput: 'w-full px-3 py-2 border-2 border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm',
    addButton: 'w-full px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-sm',
    goalRow: 'flex items-start gap-2',
    item: 'p-3 rounded-lg hover:bg-violet-50 transition-colors duration-200 border border-violet-100',
    checkbox: 'mt-1 w-4 h-4 text-violet-600 border-violet-300 rounded focus:ring-violet-500 focus:ring-2 cursor-pointer',
    label: 'flex-1 text-sm cursor-pointer',
    labelActive: 'text-violet-900',
    tagBtnBase: 'ml-1 w-6 h-6 flex items-center justify-center hover:bg-violet-200 rounded-full transition-colors duration-200 shadow-sm hover:shadow-md flex-shrink-0',
    tagBtnActive: 'bg-violet-500 text-white',
    tagBtnInactive: 'bg-violet-100 text-violet-700',
    tagBtnIcon: 'h-4 w-4',
    tagsWrapper: 'flex flex-wrap gap-1 mt-2 ml-6',
    tagBadge: 'inline-flex items-center gap-1 px-2 py-0.5 bg-violet-200 text-violet-900 rounded-full text-xs font-medium',
    tagRemove: 'ml-0.5 hover:bg-violet-300 rounded-full p-0.5 transition-colors duration-200',
    tagIcon: 'h-2.5 w-2.5',
    tagInputArea: 'mt-2 ml-6 relative',
    tagInput: 'w-full px-2 py-1 border-2 border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-xs',
    tagDropdown: 'absolute z-10 w-full mt-1 bg-white border-2 border-violet-300 rounded-lg shadow-lg max-h-40 overflow-y-auto',
    tagDropdownOption: 'w-full text-left px-2 py-1.5 hover:bg-violet-100 transition-colors duration-150 text-xs border-b border-violet-100 last:border-b-0',
    tagCount: 'text-xs text-violet-600 mt-1',
    idPrefix: 'weekly-goal-',
  },
  quarter: {
    container: 'bg-white border-2 border-purple-400 rounded-lg shadow-xl p-6 h-full',
    header: 'text-3xl font-bold text-purple-950 mb-6 pb-3 border-b-2 border-purple-200',
    addSection: 'mb-6',
    addWrapper: 'flex flex-col gap-2',
    addInput: 'w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg',
    addButton: 'w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg',
    goalRow: 'flex items-start gap-3',
    item: 'p-4 rounded-lg hover:bg-purple-50 transition-colors duration-200 border border-purple-100',
    checkbox: 'mt-1 w-5 h-5 text-purple-600 border-purple-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer',
    label: 'flex-1 text-lg cursor-pointer',
    labelActive: 'text-purple-900',
    tagBtnBase: 'ml-2 w-8 h-8 flex items-center justify-center hover:bg-purple-200 rounded-full transition-colors duration-200 shadow-sm hover:shadow-md',
    tagBtnActive: 'bg-purple-500 text-white',
    tagBtnInactive: 'bg-purple-100 text-purple-700',
    tagBtnIcon: 'h-5 w-5',
    tagsWrapper: 'flex flex-wrap gap-2 mt-3 ml-8',
    tagBadge: 'inline-flex items-center gap-1 px-3 py-1 bg-purple-200 text-purple-900 rounded-full text-sm font-medium',
    tagRemove: 'ml-1 hover:bg-purple-300 rounded-full p-0.5 transition-colors duration-200',
    tagIcon: 'h-3 w-3',
    tagInputArea: 'mt-3 ml-8 relative',
    tagInput: 'w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm',
    tagDropdown: 'absolute z-10 w-full mt-1 bg-white border-2 border-purple-300 rounded-lg shadow-lg max-h-48 overflow-y-auto',
    tagDropdownOption: 'w-full text-left px-3 py-2 hover:bg-purple-100 transition-colors duration-150 text-sm border-b border-purple-100 last:border-b-0',
    tagCount: 'text-xs text-purple-600 mt-1',
    idPrefix: 'quarterly-goal-',
  },
  year: {
    container: 'bg-white border-2 border-violet-400 rounded-lg shadow-xl p-6 h-full',
    header: 'text-3xl font-bold text-violet-950 mb-6 pb-3 border-b-2 border-violet-200',
    addSection: 'mb-6',
    addWrapper: 'flex flex-col gap-2',
    addInput: 'w-full px-4 py-3 border-2 border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-lg',
    addButton: 'w-full px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg',
    goalRow: 'flex items-start gap-3',
    item: 'p-4 rounded-lg hover:bg-violet-50 transition-colors duration-200 border border-violet-100',
    checkbox: 'mt-1 w-5 h-5 text-violet-600 border-violet-300 rounded focus:ring-violet-500 focus:ring-2 cursor-pointer',
    label: 'flex-1 text-lg cursor-pointer',
    labelActive: 'text-violet-900',
    tagBtnBase: 'ml-2 w-8 h-8 flex items-center justify-center hover:bg-violet-200 rounded-full transition-colors duration-200 shadow-sm hover:shadow-md',
    tagBtnActive: 'bg-violet-500 text-white',
    tagBtnInactive: 'bg-violet-100 text-violet-700',
    tagBtnIcon: 'h-5 w-5',
    tagsWrapper: 'flex flex-wrap gap-2 mt-3 ml-8',
    tagBadge: 'inline-flex items-center gap-1 px-3 py-1 bg-violet-200 text-violet-900 rounded-full text-sm font-medium',
    tagRemove: 'ml-1 hover:bg-violet-300 rounded-full p-0.5 transition-colors duration-200',
    tagIcon: 'h-3 w-3',
    tagInputArea: 'mt-3 ml-8 relative',
    tagInput: 'w-full px-3 py-2 border-2 border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm',
    tagDropdown: 'absolute z-10 w-full mt-1 bg-white border-2 border-violet-300 rounded-lg shadow-lg max-h-48 overflow-y-auto',
    tagDropdownOption: 'w-full text-left px-3 py-2 hover:bg-violet-100 transition-colors duration-150 text-sm border-b border-violet-100 last:border-b-0',
    tagCount: 'text-xs text-violet-600 mt-1',
    idPrefix: 'yearly-goal-',
  },
};

@Component({
  selector: 'app-goal-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './goal-list.component.html',
  styleUrl: './goal-list.component.css'
})
export class GoalListComponent {
  private store = inject(PlannerStoreService);
  private periodService = inject(PeriodService);

  @Input() scope: GoalScope = 'week';
  @Input() goals: Goal[] = [];
  @Input() availableTags: string[] = [];
  @Input() higherGoals: Goal[] = [];
  @Input() currentPeriodKey: string = '';
  @Input() isPast: boolean = false;
  @Input() isFuture: boolean = false;

  newGoal = '';
  readonly tagState = new TagInputState();

  goalLinkVisible: { [goalId: number]: boolean } = {};
  showGoalLinkDropdown: { [goalId: number]: boolean } = {};
  newGoalLinkInput: { [goalId: number]: string } = {};

  get cs(): ScopeStyle {
    return SCOPE_STYLES[this.scope];
  }

  addGoal(): void {
    if (this.newGoal.trim()) {
      this.store.addGoal(this.newGoal.trim(), this.scope);
      this.newGoal = '';
    }
  }

  toggleCompletion(goal: Goal): void {
    this.store.toggleGoalCompletion(goal.id, this.scope);
  }

  getFilteredTags(goalId: number): string[] {
    return this.tagState.getFiltered(goalId, this.goals, this.availableTags);
  }

  selectTag(goalId: number, tag: string): void {
    this.store.addGoalTag(goalId, this.scope, tag);
    this.tagState.select(goalId);
  }

  addTag(goalId: number): void {
    const filtered = this.getFilteredTags(goalId);
    if (filtered.length > 0) {
      this.selectTag(goalId, filtered[0]);
    }
  }

  removeTag(goalId: number, tagIndex: number): void {
    this.store.removeGoalTag(goalId, this.scope, tagIndex);
  }

  showGoalLinker(goalId: number, event?: Event): void {
    if (event) event.stopPropagation();
    for (const id of Object.keys(this.goalLinkVisible)) {
      const numId = Number(id);
      if (numId !== goalId && this.goalLinkVisible[numId]) {
        this.goalLinkVisible[numId] = false;
        this.newGoalLinkInput[numId] = '';
        this.showGoalLinkDropdown[numId] = false;
      }
    }
    this.goalLinkVisible[goalId] = !this.goalLinkVisible[goalId];
    if (this.goalLinkVisible[goalId]) {
      this.showGoalLinkDropdown[goalId] = true;
    }
  }

  getFilteredHigherGoals(goalId: number): Goal[] {
    const goal = this.goals.find(g => g.id === goalId);
    const linkedIds = goal?.goalIds ?? [];
    const searchTerm = this.newGoalLinkInput[goalId]?.toLowerCase() || '';
    return this.higherGoals.filter(g =>
      !linkedIds.includes(g.id) &&
      g.text.toLowerCase().includes(searchTerm)
    );
  }

  getLinkedHigherGoals(goal: Goal): Goal[] {
    const ids = goal.goalIds ?? [];
    return ids.map(id => this.higherGoals.find(g => g.id === id)).filter((g): g is Goal => !!g);
  }

  selectHigherGoal(goalId: number, targetGoalId: number): void {
    this.store.linkGoalToGoal(goalId, targetGoalId, this.scope);
    this.newGoalLinkInput[goalId] = '';
    this.showGoalLinkDropdown[goalId] = false;
  }

  unlinkHigherGoal(goalId: number, targetGoalId: number): void {
    this.store.unlinkGoalFromGoal(goalId, targetGoalId, this.scope);
  }

  @HostListener('document:click')
  closeAllDropdowns(): void {
    this.tagState.closeAll();
    for (const id of Object.keys(this.goalLinkVisible)) {
      const numId = Number(id);
      this.goalLinkVisible[numId] = false;
      this.showGoalLinkDropdown[numId] = false;
      this.newGoalLinkInput[numId] = '';
    }
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  closeAllTagInputs(): void {
    this.tagState.closeAll();
  }

  getLabelClass(goal: Goal): string {
    if (goal.completed) return `${this.cs.label} line-through text-gray-400`;
    return `${this.cs.label} ${this.cs.labelActive}`;
  }

  getTagBtnClass(goalId: number): string {
    const base = this.cs.tagBtnBase;
    return this.tagState.visible[goalId]
      ? `${base} ${this.cs.tagBtnActive}`
      : `${base} ${this.cs.tagBtnInactive}`;
  }

  getTitle(): string {
    if (!this.currentPeriodKey) {
      return this.scope === 'week' ? 'Weekly Goals'
        : this.scope === 'quarter' ? 'Quarterly Goals'
        : 'Yearly Goals';
    }
    return this.periodService.formatPeriodLabel(this.currentPeriodKey, this.scope as PeriodScope);
  }
}
