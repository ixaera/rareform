import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PlannerStoreService } from '../../services/planner-store.service';
import { PeriodScope } from '../../services/period.service';
import { DailyTasksComponent } from '../daily-tasks/daily-tasks';
import { WeeklyGoalsComponent } from '../weekly-goals/weekly-goals';
import { QuarterlyGoalsComponent } from '../quarterly-goals/quarterly-goals';
import { YearlyGoalsComponent } from '../yearly-goals/yearly-goals';
import { TagManagementComponent } from '../tag-management/tag-management';
import { AnalysisComponent } from '../analysis/analysis';
import { ArrowButtonComponent } from '../time-navigation/arrow-button.component';
import { TimeBannerComponent } from '../time-navigation/time-banner.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    DailyTasksComponent,
    WeeklyGoalsComponent,
    QuarterlyGoalsComponent,
    YearlyGoalsComponent,
    TagManagementComponent,
    AnalysisComponent,
    ArrowButtonComponent,
    TimeBannerComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  readonly store = inject(PlannerStoreService);

  title = 'Placeholder Planner Title';
  motivationalText = 'Closers get coffee';
  bottomText = 'Some cool links and stuff here';

  // View toggle state (pure UI concerns)
  showYearlyGoals = false;
  showQuarterlyGoals = false;
  showTagManagement = false;
  showAnalysis = false;

  constructor() {
    this.store.initialize();
  }

  // === View Toggles ===

  toggleYearlyGoals(): void {
    this.showYearlyGoals = !this.showYearlyGoals;
    this.showQuarterlyGoals = false;
    this.showTagManagement = false;
    this.showAnalysis = false;
  }

  toggleQuarterlyGoals(): void {
    this.showQuarterlyGoals = !this.showQuarterlyGoals;
    this.showYearlyGoals = false;
    this.showTagManagement = false;
    this.showAnalysis = false;
  }

  showDailyTasks(): void {
    this.showYearlyGoals = false;
    this.showQuarterlyGoals = false;
    this.showTagManagement = false;
    this.showAnalysis = false;
  }

  toggleTagManagement(): void {
    this.showTagManagement = !this.showTagManagement;
    if (this.showTagManagement) {
      this.showYearlyGoals = false;
      this.showQuarterlyGoals = false;
      this.showAnalysis = false;
    }
  }

  toggleAnalysis(): void {
    this.showAnalysis = !this.showAnalysis;
    if (this.showAnalysis) {
      this.showYearlyGoals = false;
      this.showQuarterlyGoals = false;
      this.showTagManagement = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // === Navigation (delegate to store) ===

  setActiveScope(scope: PeriodScope): void {
    this.store.setActiveScope(scope);

    if (scope === 'week' || scope === 'day') {
      this.showDailyTasks();
    } else if (scope === 'quarter') {
      this.showQuarterlyGoals = true;
      this.showYearlyGoals = false;
    } else if (scope === 'year') {
      this.showYearlyGoals = true;
      this.showQuarterlyGoals = false;
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
