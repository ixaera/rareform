import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Goal } from '../../models/task.interface';
import { PeriodService } from '../../services/period.service';
import { PlannerStoreService } from '../../services/planner-store.service';

@Component({
  selector: 'app-weekly-goals',
  imports: [CommonModule, FormsModule],
  templateUrl: './weekly-goals.html',
  styleUrl: './weekly-goals.css'
})
export class WeeklyGoalsComponent {
  private store = inject(PlannerStoreService);
  private periodService = inject(PeriodService);

  @Input() goals: Goal[] = [];
  @Input() availableTags: string[] = [];
  @Input() currentPeriodKey: string = '';
  @Input() isPast: boolean = false;
  @Input() isFuture: boolean = false;

  newWeeklyGoal = '';
  newWeeklyTagInput: { [goalId: number]: string } = {};
  showTagDropdown: { [goalId: number]: boolean } = {};
  tagInputVisible: { [goalId: number]: boolean } = {};

  addWeeklyGoal(): void {
    if (this.newWeeklyGoal.trim()) {
      this.store.addGoal(this.newWeeklyGoal.trim(), 'week');
      this.newWeeklyGoal = '';
    }
  }

  toggleCompletion(goal: Goal): void {
    this.store.toggleGoalCompletion(goal.id, 'week');
  }

  showWeeklyTagInput(goalId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    for (const id of Object.keys(this.tagInputVisible)) {
      const numId = Number(id);
      if (numId !== goalId && this.tagInputVisible[numId]) {
        this.tagInputVisible[numId] = false;
        this.newWeeklyTagInput[numId] = '';
        this.showTagDropdown[numId] = false;
      }
    }
    this.tagInputVisible[goalId] = true;
    this.showTagDropdown[goalId] = true;
  }

  getFilteredTags(goalId: number): string[] {
    const goal = this.goals.find(g => g.id === goalId);
    const searchTerm = this.newWeeklyTagInput[goalId]?.toLowerCase() || '';
    const goalTags = goal?.tags || [];

    return this.availableTags.filter(tag =>
      !goalTags.includes(tag) &&
      tag.toLowerCase().includes(searchTerm)
    );
  }

  selectTag(goalId: number, tag: string): void {
    this.store.addGoalTag(goalId, 'week', tag);
    this.newWeeklyTagInput[goalId] = '';
    this.showTagDropdown[goalId] = false;
  }

  onTagInputFocus(goalId: number): void {
    this.showTagDropdown[goalId] = true;
  }

  onTagInputChange(goalId: number): void {
    this.showTagDropdown[goalId] = true;
  }

  addTagToWeeklyGoal(goalId: number): void {
    const filteredTags = this.getFilteredTags(goalId);
    if (filteredTags.length > 0) {
      this.selectTag(goalId, filteredTags[0]);
    }
  }

  removeWeeklyTag(goalId: number, tagIndex: number): void {
    this.store.removeGoalTag(goalId, 'week', tagIndex);
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  closeAllTagInputs(): void {
    for (const id of Object.keys(this.tagInputVisible)) {
      this.tagInputVisible[Number(id)] = false;
    }
  }

  getWeekTitle(): string {
    if (!this.currentPeriodKey) {
      return 'Weekly Goals';
    }
    return this.periodService.formatPeriodLabel(this.currentPeriodKey, 'week');
  }
}
