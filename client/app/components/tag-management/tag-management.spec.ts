import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { TagManagementComponent } from './tag-management';

describe('TagManagementComponent', () => {
  let component: TagManagementComponent;
  let fixture: ComponentFixture<TagManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagManagementComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TagManagementComponent);
    component = fixture.componentInstance;
    component.tags = ['happy house', 'survive', 'strong body', 'sharp mind', 'create'];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Tag Creation', () => {
    it('should emit tagAdded event with valid tag', () => {
      spyOn(component.tagAdded, 'emit');
      component.newTagInput = 'newtag';

      component.createTag();

      expect(component.tagAdded.emit).toHaveBeenCalledWith('newtag');
    });

    it('should trim whitespace from tag', () => {
      spyOn(component.tagAdded, 'emit');
      component.newTagInput = '  newtag  ';

      component.createTag();

      expect(component.tagAdded.emit).toHaveBeenCalledWith('newtag');
    });

    it('should clear input after creating tag', () => {
      component.newTagInput = 'newtag';

      component.createTag();

      expect(component.newTagInput).toBe('');
    });

    it('should not emit for empty input', () => {
      spyOn(component.tagAdded, 'emit');
      component.newTagInput = '';

      component.createTag();

      expect(component.tagAdded.emit).not.toHaveBeenCalled();
    });

    it('should not emit for whitespace-only input', () => {
      spyOn(component.tagAdded, 'emit');
      component.newTagInput = '   ';

      component.createTag();

      expect(component.tagAdded.emit).not.toHaveBeenCalled();
    });

    it('should enforce max 15 character length', () => {
      spyOn(component.tagAdded, 'emit');
      component.newTagInput = 'thistagiswaytoolong';

      component.createTag();

      expect(component.tagAdded.emit).not.toHaveBeenCalled();
    });

    it('should accept tag with exactly 15 characters', () => {
      spyOn(component.tagAdded, 'emit');
      component.newTagInput = '123456789012345'; // 15 chars

      component.createTag();

      expect(component.tagAdded.emit).toHaveBeenCalledWith('123456789012345');
    });

    it('should not emit for duplicate tags', () => {
      spyOn(component.tagAdded, 'emit');
      component.newTagInput = 'survive';

      component.createTag();

      expect(component.tagAdded.emit).not.toHaveBeenCalled();
    });

    it('should clear input even if tag creation fails', () => {
      component.newTagInput = '';

      component.createTag();

      expect(component.newTagInput).toBe('');
    });
  });

  describe('Tag Editing', () => {
    it('should set editingTag when startEditTag is called', () => {
      component.startEditTag('survive');

      expect(component.editingTag).toBe('survive');
    });

    it('should initialize editTagInput with tag value', () => {
      component.startEditTag('survive');

      expect(component.editTagInput['survive']).toBe('survive');
    });

    it('should stop event propagation when event is provided', () => {
      const mockEvent = {
        stopPropagation: jasmine.createSpy('stopPropagation')
      } as any;

      component.startEditTag('survive', mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should work without event parameter', () => {
      expect(() => component.startEditTag('survive')).not.toThrow();
    });

    it('should emit tagRenamed with valid new name', () => {
      spyOn(component.tagRenamed, 'emit');
      component.editTagInput['survive'] = 'survival';

      component.saveTagEdit('survive');

      expect(component.tagRenamed.emit).toHaveBeenCalledWith({
        oldTag: 'survive',
        newTag: 'survival'
      });
    });

    it('should clear editingTag after save', () => {
      component.editingTag = 'survive';
      component.editTagInput['survive'] = 'survival';

      component.saveTagEdit('survive');

      expect(component.editingTag).toBeNull();
    });

    it('should trim whitespace from new tag name', () => {
      spyOn(component.tagRenamed, 'emit');
      component.editTagInput['survive'] = '  survival  ';

      component.saveTagEdit('survive');

      expect(component.tagRenamed.emit).toHaveBeenCalledWith({
        oldTag: 'survive',
        newTag: 'survival'
      });
    });

    it('should not emit if name is unchanged', () => {
      spyOn(component.tagRenamed, 'emit');
      component.editTagInput['survive'] = 'survive';

      component.saveTagEdit('survive');

      expect(component.tagRenamed.emit).not.toHaveBeenCalled();
    });

    it('should not emit if new name is empty', () => {
      spyOn(component.tagRenamed, 'emit');
      component.editTagInput['survive'] = '';

      component.saveTagEdit('survive');

      expect(component.tagRenamed.emit).not.toHaveBeenCalled();
    });

    it('should not emit if new name exceeds 15 characters', () => {
      spyOn(component.tagRenamed, 'emit');
      component.editTagInput['survive'] = 'thistagiswaytoolong';

      component.saveTagEdit('survive');

      expect(component.tagRenamed.emit).not.toHaveBeenCalled();
    });

    it('should accept new name with exactly 15 characters', () => {
      spyOn(component.tagRenamed, 'emit');
      component.editTagInput['survive'] = '123456789012345'; // 15 chars

      component.saveTagEdit('survive');

      expect(component.tagRenamed.emit).toHaveBeenCalledWith({
        oldTag: 'survive',
        newTag: '123456789012345'
      });
    });

    it('should clear editingTag even if validation fails', () => {
      component.editingTag = 'survive';
      component.editTagInput['survive'] = '';

      component.saveTagEdit('survive');

      expect(component.editingTag).toBeNull();
    });

    it('should handle undefined editTagInput value', () => {
      spyOn(component.tagRenamed, 'emit');

      component.saveTagEdit('nonexistent');

      expect(component.tagRenamed.emit).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Edit', () => {
    it('should clear editingTag', () => {
      component.editingTag = 'survive';

      component.cancelEdit();

      expect(component.editingTag).toBeNull();
    });

    it('should work when editingTag is already null', () => {
      component.editingTag = null;

      expect(() => component.cancelEdit()).not.toThrow();
      expect(component.editingTag).toBeNull();
    });
  });

  describe('Tag Deletion', () => {
    it('should emit tagDeleted when user confirms', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(component.tagDeleted, 'emit');

      component.deleteTag('survive');

      expect(window.confirm).toHaveBeenCalledWith('Delete tag "survive" from all goals?');
      expect(component.tagDeleted.emit).toHaveBeenCalledWith('survive');
    });

    it('should not emit tagDeleted when user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      spyOn(component.tagDeleted, 'emit');

      component.deleteTag('survive');

      expect(window.confirm).toHaveBeenCalled();
      expect(component.tagDeleted.emit).not.toHaveBeenCalled();
    });

    it('should show tag name in confirmation dialog', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteTag('happy house');

      expect(window.confirm).toHaveBeenCalledWith('Delete tag "happy house" from all goals?');
    });
  });

  describe('Event Handling', () => {
    it('should stop event propagation', () => {
      const mockEvent = {
        stopPropagation: jasmine.createSpy('stopPropagation')
      } as any;

      component.stopPropagation(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('Initial State', () => {
    it('should initialize with empty newTagInput', () => {
      expect(component.newTagInput).toBe('');
    });

    it('should initialize with null editingTag', () => {
      expect(component.editingTag).toBeNull();
    });

    it('should initialize with empty editTagInput object', () => {
      expect(component.editTagInput).toEqual({});
    });

    it('should initialize with empty tags array', () => {
      const newComponent = new TagManagementComponent();
      expect(newComponent.tags).toEqual([]);
    });
  });

  describe('Event Emitters', () => {
    it('should have tagAdded EventEmitter', () => {
      expect(component.tagAdded).toBeDefined();
      expect(component.tagAdded instanceof EventEmitter).toBe(true);
    });

    it('should have tagRenamed EventEmitter', () => {
      expect(component.tagRenamed).toBeDefined();
      expect(component.tagRenamed instanceof EventEmitter).toBe(true);
    });

    it('should have tagDeleted EventEmitter', () => {
      expect(component.tagDeleted).toBeDefined();
      expect(component.tagDeleted instanceof EventEmitter).toBe(true);
    });
  });
});
