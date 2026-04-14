import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AnalysisComponent } from './analysis';

describe('AnalysisComponent', () => {
  let component: AnalysisComponent;
  let fixture: ComponentFixture<AnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalysisComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should default to "survive" tag', () => {
      expect(component.selectedTag).toBe('survive');
    });

    it('should have data for all default tags', () => {
      expect(component.tagData['survive']).toBeDefined();
      expect(component.tagData['happy house']).toBeDefined();
      expect(component.tagData['strong body']).toBeDefined();
      expect(component.tagData['sharp mind']).toBeDefined();
      expect(component.tagData['create']).toBeDefined();
    });

    it('should have 7 days of data for each tag', () => {
      component.defaultTags.forEach(tag => {
        expect(component.tagData[tag].length).toBe(7);
      });
    });

    it('should have correct day names', () => {
      const expectedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const surviveData = component.tagData['survive'];

      surviveData.forEach((dayData, index) => {
        expect(dayData.day).toBe(expectedDays[index]);
      });
    });

    it('should have defaultTags array', () => {
      expect(component.defaultTags).toEqual([
        'survive', 'happy house', 'strong body', 'sharp mind', 'create'
      ]);
    });
  });

  describe('getCurrentData', () => {
    it('should return data for selected tag', () => {
      component.selectedTag = 'survive';

      const data = component.getCurrentData();

      expect(data).toBe(component.tagData['survive']);
    });

    it('should return different data when tag changes', () => {
      component.selectedTag = 'happy house';

      const data = component.getCurrentData();

      expect(data).toBe(component.tagData['happy house']);
    });

    it('should return empty array for non-existent tag', () => {
      component.selectedTag = 'nonexistent';

      const data = component.getCurrentData();

      expect(data).toEqual([]);
    });

    it('should return all 7 days for valid tag', () => {
      component.selectedTag = 'survive';

      const data = component.getCurrentData();

      expect(data.length).toBe(7);
    });
  });

  describe('getMaxCount', () => {
    it('should return highest count from survive data', () => {
      component.selectedTag = 'survive';

      const max = component.getMaxCount();

      expect(max).toBe(10); // Wed has count of 10
    });

    it('should return highest count from happy house data', () => {
      component.selectedTag = 'happy house';

      const max = component.getMaxCount();

      expect(max).toBe(8); // Sun has count of 8
    });

    it('should return highest count from sharp mind data', () => {
      component.selectedTag = 'sharp mind';

      const max = component.getMaxCount();

      expect(max).toBe(9); // Fri has count of 9
    });

    it('should return 1 for empty data to prevent division by zero', () => {
      component.selectedTag = 'nonexistent';

      const max = component.getMaxCount();

      expect(max).toBe(1);
    });

    it('should handle data with single value', () => {
      component.tagData['test'] = [{ day: 'Mon', count: 5 }];
      component.selectedTag = 'test';

      const max = component.getMaxCount();

      expect(max).toBe(5);
    });
  });

  describe('getBarHeight', () => {
    beforeEach(() => {
      component.selectedTag = 'survive'; // max is 10
    });

    it('should return 100 for max count', () => {
      const height = component.getBarHeight(10);

      expect(height).toBe(100);
    });

    it('should return 50 for half of max count', () => {
      const height = component.getBarHeight(5);

      expect(height).toBe(50);
    });

    it('should return 0 for count of 0', () => {
      const height = component.getBarHeight(0);

      expect(height).toBe(0);
    });

    it('should calculate correct percentage', () => {
      const height = component.getBarHeight(8);

      expect(height).toBe(80); // 8/10 * 100
    });

    it('should handle fractional results', () => {
      const height = component.getBarHeight(7);

      expect(height).toBe(70);
    });

    it('should work with different selected tag', () => {
      component.selectedTag = 'happy house'; // max is 8

      const height = component.getBarHeight(4);

      expect(height).toBe(50); // 4/8 * 100
    });
  });

  describe('getTotalTasks', () => {
    it('should calculate total for survive tag', () => {
      component.selectedTag = 'survive';

      const total = component.getTotalTasks();

      expect(total).toBe(49); // 8+6+10+7+9+5+4
    });

    it('should calculate total for happy house tag', () => {
      component.selectedTag = 'happy house';

      const total = component.getTotalTasks();

      expect(total).toBe(36); // 3+5+4+6+3+7+8
    });

    it('should calculate total for strong body tag', () => {
      component.selectedTag = 'strong body';

      const total = component.getTotalTasks();

      expect(total).toBe(23); // 2+3+2+4+3+5+4
    });

    it('should calculate total for sharp mind tag', () => {
      component.selectedTag = 'sharp mind';

      const total = component.getTotalTasks();

      expect(total).toBe(40); // 5+7+6+8+9+3+2
    });

    it('should calculate total for create tag', () => {
      component.selectedTag = 'create';

      const total = component.getTotalTasks();

      expect(total).toBe(34); // 4+3+7+5+6+4+5
    });

    it('should return 0 for empty data', () => {
      component.selectedTag = 'nonexistent';

      const total = component.getTotalTasks();

      expect(total).toBe(0);
    });
  });

  describe('getDailyAverage', () => {
    it('should calculate average for survive tag', () => {
      component.selectedTag = 'survive';

      const average = component.getDailyAverage();

      expect(average).toBe(7.0); // 49/7 = 7.0
    });

    it('should calculate average for happy house tag', () => {
      component.selectedTag = 'happy house';

      const average = component.getDailyAverage();

      expect(average).toBeCloseTo(5.1, 1); // 36/7 ≈ 5.14 rounded to 5.1
    });

    it('should calculate average for strong body tag', () => {
      component.selectedTag = 'strong body';

      const average = component.getDailyAverage();

      expect(average).toBeCloseTo(3.3, 1); // 23/7 ≈ 3.29 rounded to 3.3
    });

    it('should calculate average for sharp mind tag', () => {
      component.selectedTag = 'sharp mind';

      const average = component.getDailyAverage();

      expect(average).toBeCloseTo(5.7, 1); // 40/7 ≈ 5.71 rounded to 5.7
    });

    it('should calculate average for create tag', () => {
      component.selectedTag = 'create';

      const average = component.getDailyAverage();

      expect(average).toBeCloseTo(4.9, 1); // 34/7 ≈ 4.86 rounded to 4.9
    });

    it('should round to 1 decimal place', () => {
      component.selectedTag = 'happy house';

      const average = component.getDailyAverage();

      // Check that it has at most 1 decimal place
      const decimalPart = average.toString().split('.')[1];
      expect(!decimalPart || decimalPart.length <= 1).toBe(true);
    });

    it('should return 0 for empty data', () => {
      component.selectedTag = 'nonexistent';

      const average = component.getDailyAverage();

      expect(average).toBe(0);
    });

    it('should handle whole number averages', () => {
      component.selectedTag = 'survive';

      const average = component.getDailyAverage();

      expect(average).toBe(7.0);
    });
  });

  describe('Tag Data Integrity', () => {
    it('should have numeric counts for all days', () => {
      component.defaultTags.forEach(tag => {
        component.tagData[tag].forEach(dayData => {
          expect(typeof dayData.count).toBe('number');
        });
      });
    });

    it('should have string day names for all days', () => {
      component.defaultTags.forEach(tag => {
        component.tagData[tag].forEach(dayData => {
          expect(typeof dayData.day).toBe('string');
        });
      });
    });

    it('should have non-negative counts', () => {
      component.defaultTags.forEach(tag => {
        component.tagData[tag].forEach(dayData => {
          expect(dayData.count).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });
});
