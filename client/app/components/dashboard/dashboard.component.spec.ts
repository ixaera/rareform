import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../services/auth.service';
import { PlannerDataService } from '../../services/planner-data.service';
import { MockPlannerDataService } from '../../services/mock-planner-data.service';
import { UserService } from '../../services/user.service';
import { MockUserService } from '../../services/mock-user.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout']);
    mockAuthService.logout.and.returnValue(of(undefined));
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: PlannerDataService, useClass: MockPlannerDataService },
        { provide: UserService, useClass: MockUserService },
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
    it('should initialize with activePanel as daily', () => {
      expect(component.activePanel).toBe('daily');
    });

    describe('togglePanel(yearly)', () => {
      it('should set activePanel to yearly and reset others', () => {
        component.activePanel = 'tags';
        component.togglePanel('yearly');
        expect(component.activePanel).toBe('yearly');
      });

      it('should toggle yearly back to daily when called again', () => {
        component.togglePanel('yearly');
        expect(component.activePanel).toBe('yearly');

        component.togglePanel('yearly');
        expect(component.activePanel).toBe('daily');
      });
    });

    describe('togglePanel(quarterly)', () => {
      it('should set activePanel to quarterly and reset others', () => {
        component.activePanel = 'yearly';
        component.togglePanel('quarterly');
        expect(component.activePanel).toBe('quarterly');
      });

      it('should toggle quarterly back to daily when called again', () => {
        component.togglePanel('quarterly');
        expect(component.activePanel).toBe('quarterly');

        component.togglePanel('quarterly');
        expect(component.activePanel).toBe('daily');
      });
    });

    describe('showDailyTasks', () => {
      it('should set activePanel to daily', () => {
        component.activePanel = 'yearly';
        component.showDailyTasks();
        expect(component.activePanel).toBe('daily');
      });
    });

    describe('togglePanel(tags)', () => {
      it('should set activePanel to tags and reset others', () => {
        component.activePanel = 'yearly';
        component.togglePanel('tags');
        expect(component.activePanel).toBe('tags');
      });

      it('should toggle tags back to daily when called again', () => {
        component.togglePanel('tags');
        expect(component.activePanel).toBe('tags');

        component.togglePanel('tags');
        expect(component.activePanel).toBe('daily');
      });
    });

    describe('togglePanel(analysis)', () => {
      it('should set activePanel to analysis and reset others', () => {
        component.activePanel = 'yearly';
        component.togglePanel('analysis');
        expect(component.activePanel).toBe('analysis');
      });

      it('should toggle analysis back to daily when called again', () => {
        component.togglePanel('analysis');
        expect(component.activePanel).toBe('analysis');

        component.togglePanel('analysis');
        expect(component.activePanel).toBe('daily');
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
    it('should have title populated from UserService', () => {
      expect(component.title).toBe('Demo Planner');
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

    it('should set active scope to day by default', () => {
      expect(component.store.activeScope()).toBe('day');
    });
  });

  describe('Title from UserService', () => {
    it('should set title to the plannerName returned by UserService', () => {
      expect(component.title).toBe('Demo Planner');
    });

    it('should render the plannerName in the h1', () => {
      fixture.detectChanges();
      const h1: HTMLElement = fixture.nativeElement.querySelector('h1');
      expect(h1.textContent?.trim()).toBe('Demo Planner');
    });

    it('should reflect a different plannerName when UserService returns one', () => {
      const userService = TestBed.inject(UserService);
      spyOn(userService, 'getUser').and.returnValue(of({ plannerName: 'My Real Planner' }));

      component.ngOnInit();

      expect(component.title).toBe('My Real Planner');
    });

    it('should update the rendered h1 when plannerName changes', () => {
      const userService = TestBed.inject(UserService);
      spyOn(userService, 'getUser').and.returnValue(of({ plannerName: 'My Real Planner' }));

      component.ngOnInit();
      fixture.detectChanges();

      const h1: HTMLElement = fixture.nativeElement.querySelector('h1');
      expect(h1.textContent?.trim()).toBe('My Real Planner');
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

      it('should set activePanel to daily when switching to day scope', () => {
        component.activePanel = 'quarterly';
        component.setActiveScope('day');
        expect(component.activePanel).toBe('daily');
      });

      it('should set activePanel to weekly when switching to week scope', () => {
        component.activePanel = 'daily';
        component.setActiveScope('week');
        expect(component.activePanel).toBe('weekly');
      });

      it('should set activePanel to quarterly when switching to quarter scope', () => {
        component.setActiveScope('quarter');
        expect(component.activePanel).toBe('quarterly');
      });

      it('should sync year offset to match current quarter when switching to quarter scope', () => {
        component.setActiveScope('quarter');
        const quarterKey = component.store.currentPeriodKeys().quarter;
        const expectedYear = parseInt(quarterKey.split('-Q')[0], 10);
        const yearKey = component.store.currentPeriodKeys().year;
        expect(parseInt(yearKey, 10)).toBe(expectedYear);
      });

      it('should update year offset when navigating quarters across year boundary', () => {
        component.setActiveScope('quarter');

        // Navigate far enough back to cross a year boundary
        const currentYear = new Date().getFullYear();
        let crossed = false;
        for (let i = 0; i < 8; i++) {
          component.navigatePeriod(-1);
          const yearKey = component.store.currentPeriodKeys().year;
          if (parseInt(yearKey, 10) < currentYear) {
            crossed = true;
            break;
          }
        }

        expect(crossed).toBe(true);
        const quarterKey = component.store.currentPeriodKeys().quarter;
        const quarterYear = parseInt(quarterKey.split('-Q')[0], 10);
        const yearKey = component.store.currentPeriodKeys().year;
        expect(parseInt(yearKey, 10)).toBe(quarterYear);
      });

      it('should set activePanel to yearly when switching to year scope', () => {
        component.setActiveScope('year');
        expect(component.activePanel).toBe('yearly');
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
      it('should update daily-tasks heading when navigating forward by day', () => {
        const initialDayKey = component.store.currentPeriodKeys().day;

        component.setActiveScope('day');
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

      it('should show weekly goal-list as main panel when scope is week', () => {
        component.setActiveScope('week');
        fixture.detectChanges();

        const weeklyMainEl = fixture.nativeElement.querySelector('app-goal-list[data-scope="week"]');
        expect(weeklyMainEl).toBeTruthy();

        const dailyTasksEl = fixture.nativeElement.querySelector('app-daily-tasks');
        expect(dailyTasksEl).toBeFalsy();
      });

      it('should update weekly-goals heading when navigating one week forward', () => {
        const initialWeekKey = component.store.currentPeriodKeys().week;

        component.setActiveScope('week');
        component.navigatePeriod(1);
        fixture.detectChanges();

        const newWeekKey = component.store.currentPeriodKeys().week;
        expect(newWeekKey).not.toBe(initialWeekKey);

        // The weekly goal-list should render the new week's title
        const weeklyGoalsEl = fixture.nativeElement.querySelector('app-goal-list[data-scope="week"]');
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
