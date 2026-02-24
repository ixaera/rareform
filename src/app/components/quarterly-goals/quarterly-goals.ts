import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Goal } from '../../models/task.interface';
import { PlannerStoreService } from '../../services/planner-store.service';

@Component({
  selector: 'app-quarterly-goals',
  imports: [CommonModule, FormsModule],
  templateUrl: './quarterly-goals.html',
  styleUrl: './quarterly-goals.css'
})
export class QuarterlyGoalsComponent {
  private store = inject(PlannerStoreService);

  @Input() goals: Goal[] = [];
  @Input() availableTags: string[] = [];
  @Input() currentPeriodKey: string = '';
  @Input() isPast: boolean = false;
  @Input() isFuture: boolean = false;

  newQuarterlyGoal = '';
  newQuarterlyTagInput: { [goalId: number]: string } = {};
  showTagDropdown: { [goalId: number]: boolean } = {};
  tagInputVisible: { [goalId: number]: boolean } = {};

  addQuarterlyGoal(): void {
    if (this.newQuarterlyGoal.trim()) {
      this.store.addGoal(this.newQuarterlyGoal.trim(), 'quarter');
      this.newQuarterlyGoal = '';
    }
  }

  toggleCompletion(goal: Goal): void {
    this.store.toggleGoalCompletion(goal.id, 'quarter');
  }

  showQuarterlyTagInput(goalId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    for (const id of Object.keys(this.tagInputVisible)) {
      const numId = Number(id);
      if (numId !== goalId && this.tagInputVisible[numId]) {
        this.tagInputVisible[numId] = false;
        this.newQuarterlyTagInput[numId] = '';
        this.showTagDropdown[numId] = false;
      }
    }
    this.tagInputVisible[goalId] = true;
    this.showTagDropdown[goalId] = true;
  }

  getFilteredTags(goalId: number): string[] {
    const goal = this.goals.find(g => g.id === goalId);
    const searchTerm = this.newQuarterlyTagInput[goalId]?.toLowerCase() || '';
    const goalTags = goal?.tags || [];

    return this.availableTags.filter(tag =>
      !goalTags.includes(tag) &&
      tag.toLowerCase().includes(searchTerm)
    );
  }

  selectTag(goalId: number, tag: string): void {
    this.store.addGoalTag(goalId, 'quarter', tag);
    this.newQuarterlyTagInput[goalId] = '';
    this.showTagDropdown[goalId] = false;
  }

  onTagInputFocus(goalId: number): void {
    this.showTagDropdown[goalId] = true;
  }

  onTagInputChange(goalId: number): void {
    this.showTagDropdown[goalId] = true;
  }

  addTagToQuarterlyGoal(goalId: number): void {
    const filteredTags = this.getFilteredTags(goalId);
    if (filteredTags.length > 0) {
      this.selectTag(goalId, filteredTags[0]);
    }
  }

  removeQuarterlyTag(goalId: number, tagIndex: number): void {
    this.store.removeGoalTag(goalId, 'quarter', tagIndex);
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  closeAllTagInputs(): void {
    for (const id of Object.keys(this.tagInputVisible)) {
      this.tagInputVisible[Number(id)] = false;
    }
  }
}
