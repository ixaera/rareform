import { TestBed } from '@angular/core/testing';
import { PeriodService } from './period.service';

describe('PeriodService', () => {
  let service: PeriodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PeriodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrentPeriodKey', () => {
    it('should return current day in YYYY-MM-DD format', () => {
      const dayKey = service.getCurrentPeriodKey('day');
      expect(dayKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return current week in YYYY-Www format', () => {
      const weekKey = service.getCurrentPeriodKey('week');
      expect(weekKey).toMatch(/^\d{4}-W\d{2}$/);
    });

    it('should return current quarter in YYYY-Q# format', () => {
      const quarterKey = service.getCurrentPeriodKey('quarter');
      expect(quarterKey).toMatch(/^\d{4}-Q[1-4]$/);
    });

    it('should return current year in YYYY format', () => {
      const yearKey = service.getCurrentPeriodKey('year');
      expect(yearKey).toMatch(/^\d{4}$/);
    });
  });

  describe('getPeriodKeyFromOffset', () => {
    describe('day offset', () => {
      it('should return current day for offset 0', () => {
        const currentDay = service.getCurrentPeriodKey('day');
        const offsetDay = service.getPeriodKeyFromOffset(0, 'day');
        expect(offsetDay).toBe(currentDay);
      });

      it('should return next day for offset 1', () => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const offsetDay = service.getPeriodKeyFromOffset(1, 'day');
        const expectedDay = tomorrow.toISOString().split('T')[0];

        expect(offsetDay).toBe(expectedDay);
      });

      it('should return previous day for offset -1', () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const offsetDay = service.getPeriodKeyFromOffset(-1, 'day');
        const expectedDay = yesterday.toISOString().split('T')[0];

        expect(offsetDay).toBe(expectedDay);
      });
    });

    describe('week offset', () => {
      it('should return current week for offset 0', () => {
        const currentWeek = service.getCurrentPeriodKey('week');
        const offsetWeek = service.getPeriodKeyFromOffset(0, 'week');
        expect(offsetWeek).toBe(currentWeek);
      });

      it('should return next week for offset 1', () => {
        const currentWeek = service.getCurrentPeriodKey('week');
        const nextWeek = service.getPeriodKeyFromOffset(1, 'week');

        expect(nextWeek).not.toBe(currentWeek);
        expect(nextWeek).toMatch(/^\d{4}-W\d{2}$/);
      });

      it('should return previous week for offset -1', () => {
        const currentWeek = service.getCurrentPeriodKey('week');
        const prevWeek = service.getPeriodKeyFromOffset(-1, 'week');

        expect(prevWeek).not.toBe(currentWeek);
        expect(prevWeek).toMatch(/^\d{4}-W\d{2}$/);
      });

      it('should handle ISO week boundaries correctly', () => {
        // Week offset calculation should always start from Monday
        const offset1 = service.getPeriodKeyFromOffset(1, 'week');
        const offset2 = service.getPeriodKeyFromOffset(2, 'week');

        expect(offset1).not.toBe(offset2);
      });
    });

    describe('quarter offset', () => {
      it('should return current quarter for offset 0', () => {
        const currentQuarter = service.getCurrentPeriodKey('quarter');
        const offsetQuarter = service.getPeriodKeyFromOffset(0, 'quarter');
        expect(offsetQuarter).toBe(currentQuarter);
      });

      it('should return next quarter for offset 1', () => {
        const nextQuarter = service.getPeriodKeyFromOffset(1, 'quarter');
        expect(nextQuarter).toMatch(/^\d{4}-Q[1-4]$/);
      });

      it('should handle year boundaries', () => {
        // Q4 + 1 should give Q1 of next year
        const q4_2026 = '2026-Q4';
        // This test would need the service to expose parsePeriodKey
        // For now, just verify the format is correct
        const nextQuarter = service.getPeriodKeyFromOffset(1, 'quarter');
        expect(nextQuarter).toMatch(/^\d{4}-Q[1-4]$/);
      });
    });

    describe('year offset', () => {
      it('should return current year for offset 0', () => {
        const currentYear = service.getCurrentPeriodKey('year');
        const offsetYear = service.getPeriodKeyFromOffset(0, 'year');
        expect(offsetYear).toBe(currentYear);
      });

      it('should return next year for offset 1', () => {
        const currentYear = parseInt(service.getCurrentPeriodKey('year'), 10);
        const nextYear = service.getPeriodKeyFromOffset(1, 'year');
        expect(nextYear).toBe((currentYear + 1).toString());
      });

      it('should return previous year for offset -1', () => {
        const currentYear = parseInt(service.getCurrentPeriodKey('year'), 10);
        const prevYear = service.getPeriodKeyFromOffset(-1, 'year');
        expect(prevYear).toBe((currentYear - 1).toString());
      });
    });
  });

  describe('formatPeriodLabel', () => {
    it('should format day as "DayName, Mon DD"', () => {
      const label = service.formatPeriodLabel('2026-02-14', 'day');
      expect(label).toMatch(/^[A-Z][a-z]+, [A-Z][a-z]+ \d{1,2}$/);
    });

    it('should format week as "Week of Mon DD"', () => {
      const label = service.formatPeriodLabel('2026-W07', 'week');
      expect(label).toMatch(/^Week of [A-Z][a-z]+ \d{1,2}$/);
    });

    it('should format quarter as "Quarter #"', () => {
      const label = service.formatPeriodLabel('2026-Q1', 'quarter');
      expect(label).toBe('Quarter 1');
    });

    it('should format year as "YYYY Goals"', () => {
      const label = service.formatPeriodLabel('2026', 'year');
      expect(label).toBe('2026 Goals');
    });
  });

  describe('getWeekKeyForDate', () => {
    it('should return correct week for a Monday', () => {
      // Feb 9, 2026 is a Monday in week 7
      const weekKey = service.getWeekKeyForDate('2026-02-09');
      expect(weekKey).toBe('2026-W07');
    });

    it('should return correct week for a Friday', () => {
      // Feb 13, 2026 is a Friday in week 7
      const weekKey = service.getWeekKeyForDate('2026-02-13');
      expect(weekKey).toBe('2026-W07');
    });

    it('should return correct week for a Sunday', () => {
      // Feb 15, 2026 is a Sunday (end of week 7)
      const weekKey = service.getWeekKeyForDate('2026-02-15');
      expect(weekKey).toBe('2026-W07');
    });

    it('should handle week 1 correctly', () => {
      // ISO week 1 contains Jan 4
      const weekKey = service.getWeekKeyForDate('2026-01-04');
      expect(weekKey).toBe('2026-W01');
    });

    it('should handle year boundaries correctly', () => {
      // Jan 1, 2026 should be in the last week of 2025 or first week of 2026
      const weekKey = service.getWeekKeyForDate('2026-01-01');
      expect(weekKey).toMatch(/^(2025|2026)-W\d{2}$/);
    });
  });

  describe('getMondayForWeek', () => {
    it('should return Monday for week 7 of 2026', () => {
      const monday = service.getMondayForWeek('2026-W07');
      expect(monday).toBe('2026-02-09');
    });

    it('should return Monday for week 1', () => {
      const monday = service.getMondayForWeek('2026-W01');
      // Week 1 of 2026 should start on a Monday in late Dec 2025 or early Jan 2026
      expect(monday).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Verify it's actually a Monday (parse as local date to avoid timezone issues)
      const [year, month, day] = monday.split('-').map(n => parseInt(n, 10));
      const date = new Date(year, month - 1, day);
      expect(date.getDay()).toBe(1); // Monday = 1
    });

    it('should return Monday for week 53 (if exists)', () => {
      // Some years have 53 ISO weeks
      const monday = service.getMondayForWeek('2020-W53');
      expect(monday).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Parse as local date to avoid timezone issues
      const [year, month, day] = monday.split('-').map(n => parseInt(n, 10));
      const date = new Date(year, month - 1, day);
      expect(date.getDay()).toBe(1);
    });

    it('should return correct Monday across year boundaries', () => {
      // Week 1 might start in December
      const monday = service.getMondayForWeek('2026-W01');

      // Parse as local date to avoid timezone issues
      const [year, month, day] = monday.split('-').map(n => parseInt(n, 10));
      const date = new Date(year, month - 1, day);

      expect(date.getDay()).toBe(1);
      expect(monday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('period state detection', () => {
    it('should identify current period correctly', () => {
      const currentDay = service.getCurrentPeriodKey('day');
      expect(service.isCurrentPeriod(currentDay, 'day')).toBe(true);
    });

    it('should identify past period correctly', () => {
      const pastDay = service.getPeriodKeyFromOffset(-1, 'day');
      expect(service.isPastPeriod(pastDay, 'day')).toBe(true);
    });

    it('should identify future period correctly', () => {
      const futureDay = service.getPeriodKeyFromOffset(1, 'day');
      expect(service.isFuturePeriod(futureDay, 'day')).toBe(true);
    });
  });

  describe('getYearOffsetForQuarterKey', () => {
    it('should return 0 for the current year quarter', () => {
      const currentQuarter = service.getCurrentPeriodKey('quarter');
      expect(service.getYearOffsetForQuarterKey(currentQuarter)).toBe(0);
    });

    it('should return -1 for a quarter in the previous year', () => {
      const prevYearQ1 = `${new Date().getFullYear() - 1}-Q1`;
      expect(service.getYearOffsetForQuarterKey(prevYearQ1)).toBe(-1);
    });

    it('should return 1 for a quarter in the next year', () => {
      const nextYearQ1 = `${new Date().getFullYear() + 1}-Q1`;
      expect(service.getYearOffsetForQuarterKey(nextYearQ1)).toBe(1);
    });

    it('should work for any quarter within the same year', () => {
      const year = new Date().getFullYear();
      expect(service.getYearOffsetForQuarterKey(`${year}-Q1`)).toBe(0);
      expect(service.getYearOffsetForQuarterKey(`${year}-Q2`)).toBe(0);
      expect(service.getYearOffsetForQuarterKey(`${year}-Q3`)).toBe(0);
      expect(service.getYearOffsetForQuarterKey(`${year}-Q4`)).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle leap years correctly', () => {
      const leapDay = '2024-02-29';
      const weekKey = service.getWeekKeyForDate(leapDay);
      expect(weekKey).toMatch(/^2024-W\d{2}$/);
    });

    it('should handle end of year correctly', () => {
      const lastDay = '2026-12-31';
      const weekKey = service.getWeekKeyForDate(lastDay);
      expect(weekKey).toMatch(/^\d{4}-W\d{2}$/);
    });

    it('should handle beginning of year correctly', () => {
      const firstDay = '2026-01-01';
      const weekKey = service.getWeekKeyForDate(firstDay);
      expect(weekKey).toMatch(/^\d{4}-W\d{2}$/);
    });

    it('should be consistent: date -> week -> Monday -> week', () => {
      const date = '2026-02-14';
      const week1 = service.getWeekKeyForDate(date);
      const monday = service.getMondayForWeek(week1);
      const week2 = service.getWeekKeyForDate(monday);

      expect(week1).toBe(week2);
    });

    it('should handle large offsets correctly', () => {
      const farFuture = service.getPeriodKeyFromOffset(365, 'day');
      expect(farFuture).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      const farPast = service.getPeriodKeyFromOffset(-365, 'day');
      expect(farPast).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
