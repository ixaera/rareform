import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.interface';
import { PlannerStoreService } from '../../services/planner-store.service';

@Component({
  selector: 'app-daily-tasks',
  imports: [CommonModule, FormsModule],
  templateUrl: './daily-tasks.html',
  styleUrl: './daily-tasks.css'
})
export class DailyTasksComponent {
  private store = inject(PlannerStoreService);

  @Input() tasks: Task[] = [];
  @Input() availableTags: string[] = [];
  @Input() currentDate: string = '';
  @Input() isPast: boolean = false;
  @Input() isFuture: boolean = false;

  newTask = '';
  newTaskTagInput: { [taskId: number]: string } = {};
  showTagDropdown: { [taskId: number]: boolean } = {};
  tagInputVisible: { [taskId: number]: boolean } = {};

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

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  closeAllTagInputs(): void {
    for (const id of Object.keys(this.tagInputVisible)) {
      this.tagInputVisible[Number(id)] = false;
    }
  }

  getDayTitle(): string {
    if (!this.currentDate) {
      return 'Today';
    }
    const [year, month, day] = this.currentDate.split('-').map(num => parseInt(num, 10));
    const date = new Date(year, month - 1, day);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    return `${dayName}, ${monthName} ${day}`;
  }
}
