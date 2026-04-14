import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-time-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex justify-center mb-4" @fadeSlideIn>
      <div class="time-banner"
           [class.past]="isPast"
           [class.future]="isFuture">
        <span class="banner-text">
          {{ isPast ? '📋 Viewing past —' : '✨ Planning ahead —' }} {{ periodLabel }}
        </span>
        <button (click)="backToToday.emit()" class="back-to-today-btn">
          ● Back to Today
        </button>
      </div>
    </div>
  `,
  styles: [`
    .time-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 20px;
      border-radius: 10px;
      border-width: 1px;
      border-style: solid;
      transition: all 0.3s ease;
    }

    .time-banner.past {
      background: #F0EBF5;
      border-color: rgba(139, 127, 170, 0.3);
    }

    .time-banner.future {
      background: #F5F0FF;
      border-color: rgba(155, 143, 208, 0.3);
    }

    .banner-text {
      font-size: 13px;
      font-weight: 500;
    }

    .time-banner.past .banner-text {
      color: #8B7FAA;
    }

    .time-banner.future .banner-text {
      color: #9B8FD0;
    }

    .back-to-today-btn {
      background: #6B4EAA;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 5px 14px;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.15s ease, background 0.15s ease;
    }

    .back-to-today-btn:hover {
      transform: scale(1.04);
      background: #5A3E99;
    }

    .back-to-today-btn:active {
      transform: scale(0.98);
    }
  `],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate('300ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease', style({ opacity: 0, transform: 'translateY(-8px)' }))
      ])
    ])
  ]
})
export class TimeBannerComponent {
  @Input() periodLabel: string = '';
  @Input() isPast: boolean = false;
  @Input() isFuture: boolean = false;
  @Output() backToToday = new EventEmitter<void>();
}
