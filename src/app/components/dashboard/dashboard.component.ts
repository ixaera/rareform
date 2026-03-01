import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PlannerStoreService } from '../../services/planner-store.service';
import { PeriodScope } from '../../services/period.service';
import { UserService } from '../../services/user.service';
import { DailyTasksComponent } from '../daily-tasks/daily-tasks';
import { GoalListComponent } from '../goal-list/goal-list.component';
import { TagManagementComponent } from '../tag-management/tag-management';
import { AnalysisComponent } from '../analysis/analysis';
import { ArrowButtonComponent } from '../time-navigation/arrow-button.component';
import { TimeBannerComponent } from '../time-navigation/time-banner.component';

type ActivePanel = 'daily' | 'quarterly' | 'yearly' | 'tags' | 'analysis';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    DailyTasksComponent,
    GoalListComponent,
    TagManagementComponent,
    AnalysisComponent,
    ArrowButtonComponent,
    TimeBannerComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  readonly store = inject(PlannerStoreService);
  private userService = inject(UserService);

  title = '';
  motivationalText = 'Closers get coffee';
  bottomText = 'Some cool links and stuff here';

  activePanel: ActivePanel = 'daily';

  constructor() {
    this.store.initialize();
  }

  ngOnInit(): void {
    this.userService.getUser().subscribe(user => {
      this.title = user.plannerName;
    });
  }

  // === View Toggle ===

  togglePanel(panel: 'quarterly' | 'yearly' | 'tags' | 'analysis'): void {
    this.activePanel = this.activePanel === panel ? 'daily' : panel;
  }

  showDailyTasks(): void {
    this.activePanel = 'daily';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // === Navigation (delegate to store) ===

  setActiveScope(scope: PeriodScope): void {
    this.store.setActiveScope(scope);

    if (scope === 'week' || scope === 'day') {
      this.activePanel = 'daily';
    } else if (scope === 'quarter') {
      this.activePanel = 'quarterly';
    } else if (scope === 'year') {
      this.activePanel = 'yearly';
    }
  }

  navigatePeriod(direction: number): void {
    this.store.navigatePeriod(direction);
  }

  jumpToToday(): void {
    this.store.jumpToToday();
  }

  // === Tag Management Events ===

  onTagRenamed(event: {oldTag: string, newTag: string}): void {
    this.store.renameGlobalTag(event.oldTag, event.newTag);
  }

  onTagDeleted(tag: string): void {
    this.store.deleteGlobalTag(tag);
  }

  onTagAdded(tag: string): void {
    this.store.addGlobalTag(tag);
  }

  // === Tab Styling ===

  getTabClasses(scope: PeriodScope): string {
    const isActive = scope === this.store.activeScope();
    const baseClasses = 'px-4 py-2 rounded-md transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md relative';

    if (isActive) {
      if (scope === 'day' || scope === 'week') return `${baseClasses} bg-indigo-500 text-white`;
      if (scope === 'quarter') return `${baseClasses} bg-purple-500 text-white`;
      if (scope === 'year') return `${baseClasses} bg-violet-500 text-white`;
    }

    return `${baseClasses} bg-violet-100 text-indigo-900 hover:bg-violet-200`;
  }
}
