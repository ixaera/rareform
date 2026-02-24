import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DailyTasksComponent } from './daily-tasks';
import { Task } from '../../models/task.interface';
import { PlannerDataService } from '../../services/planner-data.service';
import { MockPlannerDataService } from '../../services/mock-planner-data.service';

describe('DailyTasksComponent', () => {
  let component: DailyTasksComponent;
  let fixture: ComponentFixture<DailyTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyTasksComponent, FormsModule],
      providers: [
        { provide: PlannerDataService, useClass: MockPlannerDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DailyTasksComponent);
    component = fixture.componentInstance;
    component.availableTags = ['happy house', 'survive', 'strong body', 'sharp mind', 'create'];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Task Creation', () => {
    it('should clear input after adding task', () => {
      component.newTask = 'New Task';
      component.addTask();
      expect(component.newTask).toBe('');
    });

    it('should ignore empty input', () => {
      component.newTask = '';
      component.addTask();
    });

    it('should ignore whitespace-only input', () => {
      component.newTask = '   ';
      component.addTask();
    });
  });

  describe('Tag Filtering', () => {
    beforeEach(() => {
      component.tasks = [
        { id: 1, text: 'Task 1', completed: false, tags: ['survive', 'create'], date: '2026-02-22', createdAt: '', updatedAt: '' }
      ];
    });

    it('should return all available tags when no search term', () => {
      const filtered = component.getFilteredTags(1);
      expect(filtered).toEqual(['happy house', 'strong body', 'sharp mind']);
    });

    it('should filter tags based on search term', () => {
      component.newTaskTagInput[1] = 'body';
      const filtered = component.getFilteredTags(1);
      expect(filtered).toEqual(['strong body']);
    });

    it('should be case-insensitive', () => {
      component.newTaskTagInput[1] = 'STRONG';
      const filtered = component.getFilteredTags(1);
      expect(filtered).toEqual(['strong body']);
    });

    it('should exclude already-added tags', () => {
      component.newTaskTagInput[1] = '';
      const filtered = component.getFilteredTags(1);
      expect(filtered).not.toContain('survive');
      expect(filtered).not.toContain('create');
    });

    it('should return empty array when no matches', () => {
      component.newTaskTagInput[1] = 'nonexistent';
      const filtered = component.getFilteredTags(1);
      expect(filtered).toEqual([]);
    });
  });

  describe('Tag Input Management', () => {
    beforeEach(() => {
      component.tasks = [
        { id: 1, text: 'Task 1', completed: false, tags: [], date: '2026-02-22', createdAt: '', updatedAt: '' },
        { id: 2, text: 'Task 2', completed: false, tags: [], date: '2026-02-22', createdAt: '', updatedAt: '' }
      ];
    });

    it('should show tag input for specific task', () => {
      component.showTaskTagInput(1);
      expect(component.tagInputVisible[1]).toBe(true);
      expect(component.showTagDropdown[1]).toBe(true);
    });

    it('should close other tag inputs when opening new one', () => {
      component.tagInputVisible[1] = true;
      component.showTagDropdown[1] = true;

      component.showTaskTagInput(2);

      expect(component.tagInputVisible[1]).toBe(false);
      expect(component.showTagDropdown[1]).toBe(false);
      expect(component.tagInputVisible[2]).toBe(true);
      expect(component.showTagDropdown[2]).toBe(true);
    });

    it('should clear tag input when closing', () => {
      component.tagInputVisible[1] = true;
      component.newTaskTagInput[1] = 'test';
      component.showTaskTagInput(2);
      expect(component.newTaskTagInput[1]).toBe('');
    });

    it('should handle event parameter', () => {
      const mockEvent = { stopPropagation: jasmine.createSpy('stopPropagation') } as any;
      component.showTaskTagInput(1, mockEvent);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should work without event parameter', () => {
      expect(() => component.showTaskTagInput(1)).not.toThrow();
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
    it('should initialize with empty newTask', () => {
      expect(component.newTask).toBe('');
    });

    it('should initialize with empty newTaskTagInput object', () => {
      expect(component.newTaskTagInput).toEqual({});
    });

    it('should initialize with empty showTagDropdown object', () => {
      expect(component.showTagDropdown).toEqual({});
    });
  });
});
