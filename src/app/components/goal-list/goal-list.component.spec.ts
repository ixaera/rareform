import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { GoalListComponent } from './goal-list.component';
import { Goal } from '../../models/task.interface';
import { PlannerDataService } from '../../services/planner-data.service';
import { MockPlannerDataService } from '../../services/mock-planner-data.service';

describe('GoalListComponent', () => {
  let component: GoalListComponent;
  let fixture: ComponentFixture<GoalListComponent>;

  function setup(scope: 'week' | 'quarter' | 'year' = 'week'): void {
    component.scope = scope;
    component.availableTags = ['happy house', 'survive', 'strong body', 'sharp mind', 'create'];
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoalListComponent, FormsModule],
      providers: [
        { provide: PlannerDataService, useClass: MockPlannerDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GoalListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with empty newGoal', () => {
      setup();
      expect(component.newGoal).toBe('');
    });

    it('should initialize with empty goals array', () => {
      setup();
      expect(component.goals).toEqual([]);
    });

    it('should have availableTags from test setup', () => {
      setup();
      expect(component.availableTags.length).toBe(5);
      expect(component.availableTags).toContain('happy house');
    });

    it('should initialize with empty tagState', () => {
      setup();
      expect(component.tagState.visible).toEqual({});
      expect(component.tagState.inputValue).toEqual({});
      expect(component.tagState.dropdownOpen).toEqual({});
    });
  });

  describe('Goal Creation', () => {
    it('should clear input after adding goal', () => {
      setup('week');
      component.newGoal = 'New Goal';
      component.addGoal();
      expect(component.newGoal).toBe('');
    });

    it('should ignore empty input', () => {
      setup('week');
      component.newGoal = '';
      expect(() => component.addGoal()).not.toThrow();
    });

    it('should ignore whitespace-only input', () => {
      setup('week');
      component.newGoal = '   ';
      expect(() => component.addGoal()).not.toThrow();
    });

    it('should clear input after adding quarterly goal', () => {
      setup('quarter');
      component.newGoal = 'New Quarter Goal';
      component.addGoal();
      expect(component.newGoal).toBe('');
    });

    it('should clear input after adding yearly goal', () => {
      setup('year');
      component.newGoal = 'New Year Goal';
      component.addGoal();
      expect(component.newGoal).toBe('');
    });
  });

  describe('Tag Filtering', () => {
    beforeEach(() => {
      setup('week');
      component.goals = [
        { id: 1, text: 'Goal 1', completed: false, tags: ['survive', 'create'], scope: 'week', periodKey: '2026-W08', createdAt: '', updatedAt: '' }
      ];
    });

    it('should return all available tags when no search term', () => {
      const filtered = component.getFilteredTags(1);
      expect(filtered).toEqual(['happy house', 'strong body', 'sharp mind']);
    });

    it('should filter tags based on search term', () => {
      component.tagState.inputValue[1] = 'body';
      const filtered = component.getFilteredTags(1);
      expect(filtered).toEqual(['strong body']);
    });

    it('should be case-insensitive', () => {
      component.tagState.inputValue[1] = 'STRONG';
      const filtered = component.getFilteredTags(1);
      expect(filtered).toEqual(['strong body']);
    });

    it('should exclude already-added tags', () => {
      component.tagState.inputValue[1] = '';
      const filtered = component.getFilteredTags(1);
      expect(filtered).not.toContain('survive');
      expect(filtered).not.toContain('create');
    });

    it('should return empty array when no matches', () => {
      component.tagState.inputValue[1] = 'nonexistent';
      const filtered = component.getFilteredTags(1);
      expect(filtered).toEqual([]);
    });
  });

  describe('Tag Input Management', () => {
    beforeEach(() => {
      setup('week');
      component.goals = [
        { id: 1, text: 'Goal 1', completed: false, tags: [], scope: 'week', periodKey: '2026-W08', createdAt: '', updatedAt: '' },
        { id: 2, text: 'Goal 2', completed: false, tags: [], scope: 'week', periodKey: '2026-W08', createdAt: '', updatedAt: '' }
      ];
    });

    it('should show tag input for specific goal', () => {
      component.tagState.open(1);
      expect(component.tagState.visible[1]).toBe(true);
      expect(component.tagState.dropdownOpen[1]).toBe(true);
    });

    it('should close other tag inputs when opening new one', () => {
      component.tagState.visible[1] = true;
      component.tagState.dropdownOpen[1] = true;

      component.tagState.open(2);

      expect(component.tagState.visible[1]).toBe(false);
      expect(component.tagState.dropdownOpen[1]).toBe(false);
      expect(component.tagState.visible[2]).toBe(true);
      expect(component.tagState.dropdownOpen[2]).toBe(true);
    });

    it('should clear tag input when closing', () => {
      component.tagState.visible[1] = true;
      component.tagState.inputValue[1] = 'test';
      component.tagState.open(2);
      expect(component.tagState.inputValue[1]).toBe('');
    });

    it('should handle event parameter', () => {
      const mockEvent = { stopPropagation: jasmine.createSpy('stopPropagation') } as any;
      component.tagState.open(1, mockEvent);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should work without event parameter', () => {
      expect(() => component.tagState.open(1)).not.toThrow();
    });
  });

  describe('Tag Input Events', () => {
    beforeEach(() => setup('week'));

    it('should show dropdown on focus', () => {
      component.tagState.dropdownOpen[1] = false;
      component.tagState.onFocus(1);
      expect(component.tagState.dropdownOpen[1]).toBe(true);
    });

    it('should show dropdown on input change', () => {
      component.tagState.dropdownOpen[1] = false;
      component.tagState.onChange(1);
      expect(component.tagState.dropdownOpen[1]).toBe(true);
    });
  });

  describe('Event Handling', () => {
    it('should stop event propagation', () => {
      setup();
      const mockEvent = { stopPropagation: jasmine.createSpy('stopPropagation') } as any;
      component.stopPropagation(mockEvent);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('Close All Tag Inputs', () => {
    beforeEach(() => setup('week'));

    it('should close all tag inputs', () => {
      component.tagState.visible[1] = true;
      component.tagState.visible[2] = true;
      component.closeAllTagInputs();
      expect(component.tagState.visible[1]).toBe(false);
      expect(component.tagState.visible[2]).toBe(false);
    });

    it('should handle empty state', () => {
      expect(() => component.closeAllTagInputs()).not.toThrow();
    });
  });

  describe('Color scheme by scope', () => {
    it('should use violet-300 border for week scope', () => {
      setup('week');
      expect(component.cs.container).toContain('border-violet-300');
    });

    it('should use purple-400 border for quarter scope', () => {
      setup('quarter');
      expect(component.cs.container).toContain('border-purple-400');
    });

    it('should use violet-400 border for year scope', () => {
      setup('year');
      expect(component.cs.container).toContain('border-violet-400');
    });

    it('should use compact text size for week scope', () => {
      setup('week');
      expect(component.cs.label).toContain('text-sm');
    });

    it('should use large text size for quarter scope', () => {
      setup('quarter');
      expect(component.cs.label).toContain('text-lg');
    });
  });

  describe('getLabelClass', () => {
    beforeEach(() => setup('week'));

    it('should add line-through for completed goals', () => {
      const goal: Goal = { id: 1, text: '', completed: true, tags: [], scope: 'week', periodKey: '', createdAt: '', updatedAt: '' };
      expect(component.getLabelClass(goal)).toContain('line-through');
    });

    it('should not add line-through for incomplete goals', () => {
      const goal: Goal = { id: 1, text: '', completed: false, tags: [], scope: 'week', periodKey: '', createdAt: '', updatedAt: '' };
      expect(component.getLabelClass(goal)).not.toContain('line-through');
    });
  });

  describe('getTitle', () => {
    it('should return fallback title when no period key for week', () => {
      setup('week');
      component.currentPeriodKey = '';
      expect(component.getTitle()).toBe('Weekly Goals');
    });

    it('should return fallback title when no period key for quarter', () => {
      setup('quarter');
      component.currentPeriodKey = '';
      expect(component.getTitle()).toBe('Quarterly Goals');
    });

    it('should return fallback title when no period key for year', () => {
      setup('year');
      component.currentPeriodKey = '';
      expect(component.getTitle()).toBe('Yearly Goals');
    });

    it('should format period label for week when key is provided', () => {
      setup('week');
      component.currentPeriodKey = '2026-W08';
      expect(component.getTitle()).toContain('Week of');
    });

    it('should format period label for quarter when key is provided', () => {
      setup('quarter');
      component.currentPeriodKey = '2026-Q1';
      expect(component.getTitle()).toContain('Quarter 1');
    });

    it('should format period label for year when key is provided', () => {
      setup('year');
      component.currentPeriodKey = '2026';
      expect(component.getTitle()).toContain('2026 Goals');
    });
  });
});
