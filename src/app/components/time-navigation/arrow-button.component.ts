import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-arrow-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="navigate.emit()"
      [disabled]="disabled"
      class="!bg-transparent !shadow-none border-0 text-violet-600 text-3xl font-bold p-1 cursor-pointer opacity-70 hover:opacity-100 hover:text-violet-700 transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed outline-none focus:outline-none"
      [class.hover:-translate-x-0.5]="direction === 'left'"
      [class.hover:translate-x-0.5]="direction === 'right'"
      [attr.aria-label]="ariaLabel">
      {{ direction === 'left' ? '<' : '>' }}
    </button>
  `
})
export class ArrowButtonComponent {
  @Input() direction: 'left' | 'right' = 'left';
  @Input() disabled: boolean = false;
  @Output() navigate = new EventEmitter<void>();

  get ariaLabel(): string {
    return `Navigate to ${this.direction === 'left' ? 'previous' : 'next'} period`;
  }
}
