import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { QuarterlyGoalsComponent } from './quarterly-goals';
import { Goal } from '../../models/task.interface';
import { PlannerDataService } from '../../services/planner-data.service';
import { MockPlannerDataService } from '../../services/mock-planner-data.service';

describe('QuarterlyGoalsComponent', () => {
  let component: QuarterlyGoalsComponent;
  let fixture: ComponentFixture<QuarterlyGoalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuarterlyGoalsComponent, FormsModule],
      providers: [
        { provide: PlannerDataService, useClass: MockPlannerDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuarterlyGoalsComponent);
    component = fixture.componentInstance;
    component.availableTags = ['happy house', 'survive', 'strong body', 'sharp mind', 'create'];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Goal Creation', () => {
    it('should clear input after adding goal', () => {
      component.newQuarterlyGoal = 'New Goal';
      component.addQuarterlyGoal();
      expect(component.newQuarterlyGoal).toBe('');
    });

    it('should ignore empty input', () => {
      component.newQuarterlyGoal = '';
      component.addQuarterlyGoal();
    });

    it('should ignore whitespace-only input', () => {
      component.newQuarterlyGoal = '   ';
      component.addQuarterlyGoal();
    });
  });

  describe('Tag Filtering', () => {
    beforeEach(() => {
      component.goals = [
        { id: 1, text: 'Goal 1', completed: false, tags: ['survive', 'create'], scope: 'quarter', periodKey: '2026-Q1', createdAt: '', updatedAt: '' }
      ];
    });

    it('should return all available tags when no search term', () => {
      const filtered = component.getFilteredTags(1);
      expect(filtered).toEqual(['happy house', 'strong body', 'sharp mind']);
    });

    it('should filter tags based on search term', () => {
      component.newQuarterlyTagInput[1] = 'body';
      const filtered = component.getFilteredTags(1);
      expect(filtered).toEqual(['strong body']);
    });

    it('should be case-insensitive', () => {
      component.newQuarterlyTagInput[1] = 'STRONG';
      const filtered = component.getFilteredTags(1);
      expect(filtered).toEqual(['strong body']);
    });

    it('should exclude already-added tags', () => {
      component.newQuarterlyTagInput[1] = '';
      const filtered = component.getFilteredTags(1);
      expect(filtered).not.toContain('survive');
      expect(filtered).not.toContain('create');
    });

    it('should return empty array when no matches', () => {
      component.newQuarterlyTagInput[1] = 'nonexistent';
      const filtered = component.getFilteredTags(1);
      expect(filtered).toEqual([]);
    });
  });

  describe('Tag Input Management', () => {
    beforeEach(() => {
      component.goals = [
        { id: 1, text: 'Goal 1', completed: false, tags: [], scope: 'quarter', periodKey: '2026-Q1', createdAt: '', updatedAt: '' },
        { id: 2, text: 'Goal 2', completed: false, tags: [], scope: 'quarter', periodKey: '2026-Q1', createdAt: '', updatedAt: '' }
      ];
    });

    it('should show tag input for specific goal', () => {
      component.showQuarterlyTagInput(1);
      expect(component.tagInputVisible[1]).toBe(true);
      expect(component.showTagDropdown[1]).toBe(true);
    });

    it('should close other tag inputs when opening new one', () => {
      component.tagInputVisible[1] = true;
      component.showTagDropdown[1] = true;

      component.showQuarterlyTagInput(2);

      expect(component.tagInputVisible[1]).toBe(false);
      expect(component.showTagDropdown[1]).toBe(false);
      expect(component.tagInputVisible[2]).toBe(true);
      expect(component.showTagDropdown[2]).toBe(true);
    });

    it('should clear tag input when closing', () => {
      component.tagInputVisible[1] = true;
      component.newQuarterlyTagInput[1] = 'test';
      component.showQuarterlyTagInput(2);
      expect(component.newQuarterlyTagInput[1]).toBe('');
    });

    it('should handle event parameter', () => {
      const mockEvent = { stopPropagation: jasmine.createSpy('stopPropagation') } as any;
      component.showQuarterlyTagInput(1, mockEvent);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should work without event parameter', () => {
      expect(() => component.showQuarterlyTagInput(1)).not.toThrow();
    });
  });

  describe('Tag Input Events', () => {
    it('should show dropdown on focus', () => {
      component.showTagDropdown[1] = false;
      component.onTagInputFocus(1);
      expect(component.showTagDropdown[1]).toBe(true);
    });

    it('should show dropdown on input change', () => {
      component.showTagDropdown[1] = false;
      component.onTagInputChange(1);
      expect(component.showTagDropdown[1]).toBe(true);
    });
  });

  describe('Event Handling', () => {
    it('should stop event propagation', () => {
      const mockEvent = { stopPropagation: jasmine.createSpy('stopPropagation') } as any;
      component.stopPropagation(mockEvent);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('Close All Tag Inputs', () => {
    it('should close all tag inputs', () => {
      component.tagInputVisible[1] = true;
      component.tagInputVisible[2] = true;
      component.closeAllTagInputs();
      expect(component.tagInputVisible[1]).toBe(false);
      expect(component.tagInputVisible[2]).toBe(false);
    });

    it('should handle empty state', () => {
      expect(() => component.closeAllTagInputs()).not.toThrow();
    });
  });

  describe('Initial State', () => {
    it('should initialize with empty newQuarterlyGoal', () => {
      expect(component.newQuarterlyGoal).toBe('');
    });

    it('should initialize with empty newQuarterlyTagInput object', () => {
      expect(component.newQuarterlyTagInput).toEqual({});
    });

    it('should initialize with empty showTagDropdown object', () => {
      expect(component.showTagDropdown).toEqual({});
    });
  });
});
