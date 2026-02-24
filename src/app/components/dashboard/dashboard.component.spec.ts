import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../services/auth.service';
import { PlannerDataService } from '../../services/planner-data.service';
import { MockPlannerDataService } from '../../services/mock-planner-data.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: PlannerDataService, useClass: MockPlannerDataService },
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('View Toggle Logic', () => {
    it('should initialize with all views hidden except daily tasks', () => {
      expect(component.showYearlyGoals).toBe(false);
      expect(component.showQuarterlyGoals).toBe(false);
      expect(component.showTagManagement).toBe(false);
      expect(component.showAnalysis).toBe(false);
    });

    describe('toggleYearlyGoals', () => {
      it('should show yearly goals and hide other views', () => {
        component.showQuarterlyGoals = true;
        component.showTagManagement = true;
        component.showAnalysis = true;

        component.toggleYearlyGoals();

        expect(component.showYearlyGoals).toBe(true);
        expect(component.showQuarterlyGoals).toBe(false);
        expect(component.showTagManagement).toBe(false);
        expect(component.showAnalysis).toBe(false);
      });

      it('should toggle yearly goals view off when called again', () => {
        component.toggleYearlyGoals();
        expect(component.showYearlyGoals).toBe(true);

        component.toggleYearlyGoals();
        expect(component.showYearlyGoals).toBe(false);
      });
    });

    describe('toggleQuarterlyGoals', () => {
      it('should show quarterly goals and hide other views', () => {
        component.showYearlyGoals = true;
        component.showTagManagement = true;
        component.showAnalysis = true;

        component.toggleQuarterlyGoals();

        expect(component.showQuarterlyGoals).toBe(true);
        expect(component.showYearlyGoals).toBe(false);
        expect(component.showTagManagement).toBe(false);
        expect(component.showAnalysis).toBe(false);
      });

      it('should toggle quarterly goals view off when called again', () => {
        component.toggleQuarterlyGoals();
        expect(component.showQuarterlyGoals).toBe(true);

        component.toggleQuarterlyGoals();
        expect(component.showQuarterlyGoals).toBe(false);
      });
    });

    describe('showDailyTasks', () => {
      it('should hide all other views', () => {
        component.showYearlyGoals = true;
        component.showQuarterlyGoals = true;
        component.showTagManagement = true;
        component.showAnalysis = true;

        component.showDailyTasks();

        expect(component.showYearlyGoals).toBe(false);
        expect(component.showQuarterlyGoals).toBe(false);
        expect(component.showTagManagement).toBe(false);
        expect(component.showAnalysis).toBe(false);
      });
    });

    describe('toggleTagManagement', () => {
      it('should show tag management and hide other views', () => {
        component.showYearlyGoals = true;
        component.showQuarterlyGoals = true;
        component.showAnalysis = true;

        component.toggleTagManagement();

        expect(component.showTagManagement).toBe(true);
        expect(component.showYearlyGoals).toBe(false);
        expect(component.showQuarterlyGoals).toBe(false);
        expect(component.showAnalysis).toBe(false);
      });

      it('should toggle tag management view off when called again', () => {
        component.toggleTagManagement();
        expect(component.showTagManagement).toBe(true);

        component.toggleTagManagement();
        expect(component.showTagManagement).toBe(false);
      });
    });

    describe('toggleAnalysis', () => {
      it('should show analysis and hide other views', () => {
        component.showYearlyGoals = true;
        component.showQuarterlyGoals = true;
        component.showTagManagement = true;

        component.toggleAnalysis();

        expect(component.showAnalysis).toBe(true);
        expect(component.showYearlyGoals).toBe(false);
        expect(component.showQuarterlyGoals).toBe(false);
        expect(component.showTagManagement).toBe(false);
      });

      it('should toggle analysis view off when called again', () => {
        component.toggleAnalysis();
        expect(component.showAnalysis).toBe(true);

        component.toggleAnalysis();
        expect(component.showAnalysis).toBe(false);
      });
    });
  });

  describe('Tag Management', () => {
    describe('onTagRenamed', () => {
      it('should call store renameGlobalTag', () => {
        spyOn(component.store, 'renameGlobalTag');
        component.onTagRenamed({ oldTag: 'survive', newTag: 'survival' });
        expect(component.store.renameGlobalTag).toHaveBeenCalledWith('survive', 'survival');
      });
    });

    describe('onTagDeleted', () => {
      it('should call store deleteGlobalTag', () => {
        spyOn(component.store, 'deleteGlobalTag');
        component.onTagDeleted('survive');
        expect(component.store.deleteGlobalTag).toHaveBeenCalledWith('survive');
      });
    });

    describe('onTagAdded', () => {
      it('should call store addGlobalTag', () => {
        spyOn(component.store, 'addGlobalTag');
        component.onTagAdded('newtag');
        expect(component.store.addGlobalTag).toHaveBeenCalledWith('newtag');
      });
    });
  });

  describe('Other Functionality', () => {
    describe('logout', () => {
      it('should call authService.logout', () => {
        component.logout();
        expect(mockAuthService.logout).toHaveBeenCalled();
      });

      it('should navigate to /login', () => {
        component.logout();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      });
    });
  });

  describe('Initial State', () => {
    it('should have correct title', () => {
      expect(component.title).toBe('Placeholder Planner Title');
    });

    it('should have store with default tags', () => {
      expect(component.store.globalTags()).toEqual(['happy house', 'survive', 'strong body', 'sharp mind', 'create']);
    });

    it('should have tasks loaded for today', () => {
      expect(component.store.currentTasks().length).toBe(6);
    });

    it('should have weekly goals loaded', () => {
      expect(component.store.currentWeeklyGoals().length).toBeGreaterThanOrEqual(1);
    });

    it('should have quarterly goals loaded', () => {
      expect(component.store.currentQuarterlyGoals().length).toBeGreaterThanOrEqual(1);
    });

    it('should have yearly goals loaded', () => {
      expect(component.store.currentYearlyGoals().length).toBeGreaterThanOrEqual(1);
    });

    it('should initialize all period offsets to 0', () => {
      const offsets = component.store.periodOffsets();
      expect(offsets.day).toBe(0);
      expect(offsets.week).toBe(0);
      expect(offsets.quarter).toBe(0);
      expect(offsets.year).toBe(0);
    });

    it('should initialize all period keys', () => {
      const keys = component.store.currentPeriodKeys();
      expect(keys.day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(keys.week).toMatch(/^\d{4}-W\d{2}$/);
      expect(keys.quarter).toMatch(/^\d{4}-Q[1-4]$/);
      expect(keys.year).toMatch(/^\d{4}$/);
    });

    it('should set active scope to week by default', () => {
      expect(component.store.activeScope()).toBe('week');
    });
  });

  describe('Time Navigation', () => {
    describe('navigatePeriod', () => {
      it('should change period offset via store', () => {
        component.setActiveScope('day');
        component.navigatePeriod(1);
        expect(component.store.periodOffsets().day).toBe(1);
      });

      it('should decrement offset when navigating backward', () => {
        component.setActiveScope('week');
        component.navigatePeriod(-1);
        expect(component.store.periodOffsets().week).toBe(-1);
      });

      it('should update period keys after navigation', () => {
        const oldDayKey = component.store.currentPeriodKeys().day;
        component.setActiveScope('day');
        component.navigatePeriod(1);
        expect(component.store.currentPeriodKeys().day).not.toBe(oldDayKey);
      });
    });

    describe('jumpToToday', () => {
      it('should reset all offsets to 0', () => {
        component.setActiveScope('week');
        component.navigatePeriod(3);
        component.jumpToToday();

        const offsets = component.store.periodOffsets();
        expect(offsets.day).toBe(0);
        expect(offsets.week).toBe(0);
        expect(offsets.quarter).toBe(0);
        expect(offsets.year).toBe(0);
      });
    });

    describe('setActiveScope', () => {
      it('should change the active scope', () => {
        component.setActiveScope('day');
        expect(component.store.activeScope()).toBe('day');
      });

      it('should show daily tasks view when switching to day or week', () => {
        component.showQuarterlyGoals = true;
        component.setActiveScope('day');
        expect(component.showYearlyGoals).toBe(false);
        expect(component.showQuarterlyGoals).toBe(false);
      });

      it('should show quarterly goals when switching to quarter scope', () => {
        component.setActiveScope('quarter');
        expect(component.showQuarterlyGoals).toBe(true);
        expect(component.showYearlyGoals).toBe(false);
      });

      it('should show yearly goals when switching to year scope', () => {
        component.setActiveScope('year');
        expect(component.showYearlyGoals).toBe(true);
        expect(component.showQuarterlyGoals).toBe(false);
      });
    });

    describe('period state checkers', () => {
      it('isAtCurrentPeriod should return true for offset 0', () => {
        expect(component.store.isAtCurrentPeriod('day')).toBe(true);
        expect(component.store.isAtCurrentPeriod('week')).toBe(true);
      });

      it('isPastPeriod should return true for negative offset', () => {
        component.setActiveScope('week');
        component.navigatePeriod(-1);
        expect(component.store.isPastPeriod()).toBe(true);
      });

      it('isPastPeriod should return false for zero offset', () => {
        expect(component.store.isPastPeriod()).toBe(false);
      });

      it('isFuturePeriod should return true for positive offset', () => {
        component.setActiveScope('week');
        component.navigatePeriod(1);
        expect(component.store.isFuturePeriod()).toBe(true);
      });

      it('isFuturePeriod should return false for zero offset', () => {
        expect(component.store.isFuturePeriod()).toBe(false);
      });
    });

    describe('getTabClasses', () => {
      it('should return active classes for active scope', () => {
        component.setActiveScope('week');
        const classes = component.getTabClasses('week');
        expect(classes).toContain('bg-indigo-500');
        expect(classes).toContain('text-white');
      });

      it('should return inactive classes for non-active scope', () => {
        component.setActiveScope('week');
        const classes = component.getTabClasses('day');
        expect(classes).toContain('bg-violet-100');
        expect(classes).toContain('text-indigo-900');
      });

      it('should use purple for quarter scope when active', () => {
        component.setActiveScope('quarter');
        const classes = component.getTabClasses('quarter');
        expect(classes).toContain('bg-purple-500');
      });

      it('should use violet for year scope when active', () => {
        component.setActiveScope('year');
        const classes = component.getTabClasses('year');
        expect(classes).toContain('bg-violet-500');
      });
    });

    // Regression: navigating one week forward caused body components to stay stuck
    // on the current week because the time-banner's @fadeSlideIn animation threw
    // NG05105 (missing animations provider), breaking Angular's rendering pipeline.
    describe('navigation rendering with time banner', () => {
      it('should update daily-tasks heading when navigating one week forward', () => {
        const initialDayKey = component.store.currentPeriodKeys().day;

        component.setActiveScope('week');
        component.navigatePeriod(1);
        fixture.detectChanges();

        const newDayKey = component.store.currentPeriodKeys().day;
        expect(newDayKey).not.toBe(initialDayKey);

        // The daily-tasks component should render the new day's title
        const dailyTasksEl = fixture.nativeElement.querySelector('app-daily-tasks');
        expect(dailyTasksEl).toBeTruthy();
        const heading = dailyTasksEl.querySelector('h2');
        expect(heading).toBeTruthy();
        // The heading should NOT contain the initial day's date
        const [, , initialDay] = initialDayKey.split('-').map((n: string) => parseInt(n, 10));
        // It should reflect the new period, not the old one
        expect(heading.textContent).not.toContain(` ${initialDay}`);
      });

      it('should update weekly-goals heading when navigating one week forward', () => {
        const initialWeekKey = component.store.currentPeriodKeys().week;

        component.setActiveScope('week');
        component.navigatePeriod(1);
        fixture.detectChanges();

        const newWeekKey = component.store.currentPeriodKeys().week;
        expect(newWeekKey).not.toBe(initialWeekKey);

        // The weekly-goals component should render the new week's title
        const weeklyGoalsEl = fixture.nativeElement.querySelector('app-weekly-goals');
        expect(weeklyGoalsEl).toBeTruthy();
        const heading = weeklyGoalsEl.querySelector('h2');
        expect(heading).toBeTruthy();
        // Heading should reflect the new week label from the store
        const expectedLabel = component.store.getWeekLabel();
        expect(heading.textContent?.trim()).toBe(expectedLabel);
      });

      it('should show the time banner when navigating away from current period', () => {
        component.setActiveScope('week');
        component.navigatePeriod(1);
        fixture.detectChanges();

        const banner = fixture.nativeElement.querySelector('app-time-banner');
        expect(banner).toBeTruthy();
      });

      it('should hide the time banner after jumping back to today', () => {
        component.setActiveScope('week');
        component.navigatePeriod(1);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-time-banner')).toBeTruthy();

        component.jumpToToday();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-time-banner')).toBeFalsy();
      });
    });
  });
});
