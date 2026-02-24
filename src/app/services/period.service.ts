import { Injectable } from '@angular/core';
import {
  getISOWeek,
  startOfISOWeek,
  addWeeks,
  addDays,
  addQuarters,
  addYears,
  differenceInCalendarDays,
  format,
  startOfQuarter,
  endOfQuarter,
  endOfISOWeek,
  getYear,
  getQuarter,
  parseISO,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay
} from 'date-fns';

export type PeriodScope = 'day' | 'week' | 'quarter' | 'year';

export interface DateRange {
  start: Date;
  end: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PeriodService {
  private today: Date;

  constructor() {
    this.today = startOfDay(new Date());
  }

  /**
   * Get the current period key for a given scope
   */
  getCurrentPeriodKey(scope: PeriodScope): string {
    return this.formatPeriodKey(this.today, scope);
  }

  /**
   * Get period key from an offset (0 = current, -1 = previous, +1 = next)
   */
  getPeriodKeyFromOffset(offset: number, scope: PeriodScope): string {
    const date = this.getDateFromOffset(offset, scope);
    return this.formatPeriodKey(date, scope);
  }

  /**
   * Get the next period key
   */
  getNextPeriod(currentKey: string, scope: PeriodScope): string {
    const date = this.parsePeriodKey(currentKey, scope);
    const nextDate = this.getDateFromOffset(1, scope, date);
    return this.formatPeriodKey(nextDate, scope);
  }

  /**
   * Get the previous period key
   */
  getPrevPeriod(currentKey: string, scope: PeriodScope): string {
    const date = this.parsePeriodKey(currentKey, scope);
    const prevDate = this.getDateFromOffset(-1, scope, date);
    return this.formatPeriodKey(prevDate, scope);
  }

  /**
   * Format a period key for display
   */
  formatPeriodLabel(key: string, scope: PeriodScope): string {
    const date = this.parsePeriodKey(key, scope);

    switch (scope) {
      case 'day':
        // "Monday, Jan 27"
        return format(date, 'EEEE, MMM d');

      case 'week':
        // "Week of Jan 27" (Monday of the week)
        const weekStart = startOfISOWeek(date);
        return `Week of ${format(weekStart, 'MMM d')}`;

      case 'quarter':
        // "Quarter 1" or "Quarter 2", etc.
        const quarter = getQuarter(date);
        return `Quarter ${quarter}`;

      case 'year':
        // "2026 Goals"
        return `${format(date, 'yyyy')} Goals`;

      default:
        return key;
    }
  }

  /**
   * Check if a period key represents the current period
   */
  isCurrentPeriod(key: string, scope: PeriodScope): boolean {
    const currentKey = this.getCurrentPeriodKey(scope);
    return key === currentKey;
  }

  /**
   * Check if a period key represents a past period
   */
  isPastPeriod(key: string, scope: PeriodScope): boolean {
    const date = this.parsePeriodKey(key, scope);
    const dateRange = this.getDateRangeForPeriod(key, scope);
    return isBefore(dateRange.end, this.today);
  }

  /**
   * Check if a period key represents a future period
   */
  isFuturePeriod(key: string, scope: PeriodScope): boolean {
    const date = this.parsePeriodKey(key, scope);
    const dateRange = this.getDateRangeForPeriod(key, scope);
    return isAfter(dateRange.start, this.today);
  }

  /**
   * Get the date range for a period
   */
  getDateRangeForPeriod(key: string, scope: PeriodScope): DateRange {
    const date = this.parsePeriodKey(key, scope);

    switch (scope) {
      case 'day':
        return {
          start: startOfDay(date),
          end: startOfDay(date)
        };

      case 'week':
        return {
          start: startOfISOWeek(date),
          end: endOfISOWeek(date)
        };

      case 'quarter':
        return {
          start: startOfQuarter(date),
          end: endOfQuarter(date)
        };

      case 'year':
        return {
          start: parseISO(`${getYear(date)}-01-01`),
          end: parseISO(`${getYear(date)}-12-31`)
        };

      default:
        return { start: date, end: date };
    }
  }

  /**
   * Get the start date for a week key
   */
  getWeekStartDate(weekKey: string): Date {
    return this.parsePeriodKey(weekKey, 'week');
  }

  /**
   * Get the week key for a given date
   */
  getWeekKeyForDate(dateKey: string): string {
    const date = parseISO(dateKey);
    const year = getYear(date);
    const week = getISOWeek(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  /**
   * Get the Monday (first day) of a week as a date key
   */
  getMondayForWeek(weekKey: string): string {
    const monday = this.parsePeriodKey(weekKey, 'week');
    return format(monday, 'yyyy-MM-dd');
  }

  /**
   * Get the day offset from today for a given date key
   */
  getDayOffsetForDateKey(dateKey: string): number {
    const target = parseISO(dateKey);
    return differenceInCalendarDays(target, this.today);
  }

  /**
   * Get the week offset from this week for a given date key
   */
  getWeekOffsetForDateKey(dateKey: string): number {
    const target = parseISO(dateKey);
    const targetMonday = startOfISOWeek(target);
    const todayMonday = startOfISOWeek(this.today);
    return Math.round(differenceInCalendarDays(targetMonday, todayMonday) / 7);
  }

  /**
   * Get all day keys (Mon-Sun) for a given week key
   */
  getDayKeysForWeek(weekKey: string): string[] {
    const monday = this.parsePeriodKey(weekKey, 'week');
    const keys: string[] = [];
    for (let i = 0; i < 7; i++) {
      keys.push(format(addDays(monday, i), 'yyyy-MM-dd'));
    }
    return keys;
  }

  /**
   * Format a date as a period key
   */
  private formatPeriodKey(date: Date, scope: PeriodScope): string {
    switch (scope) {
      case 'day':
        // "2026-01-27"
        return format(date, 'yyyy-MM-dd');

      case 'week':
        // "2026-W05"
        const year = getYear(date);
        const week = getISOWeek(date);
        return `${year}-W${week.toString().padStart(2, '0')}`;

      case 'quarter':
        // "2026-Q1"
        const qYear = getYear(date);
        const quarter = getQuarter(date);
        return `${qYear}-Q${quarter}`;

      case 'year':
        // "2026"
        return format(date, 'yyyy');

      default:
        return '';
    }
  }

  /**
   * Parse a period key into a Date
   */
  private parsePeriodKey(key: string, scope: PeriodScope): Date {
    switch (scope) {
      case 'day':
        // "2026-01-27" → Date
        return parseISO(key);

      case 'week':
        // "2026-W05" → Monday of that week
        const [yearStr, weekStr] = key.split('-W');
        const year = parseInt(yearStr, 10);
        const week = parseInt(weekStr, 10);

        // Calculate the date: start with Jan 4 (always in week 1), then add weeks
        const jan4 = parseISO(`${year}-01-04`);
        const weekStart = startOfISOWeek(jan4);
        return addWeeks(weekStart, week - 1);

      case 'quarter':
        // "2026-Q1" → First day of that quarter
        const [qYearStr, qStr] = key.split('-Q');
        const qYear = parseInt(qYearStr, 10);
        const q = parseInt(qStr, 10);

        // Q1 = Jan 1, Q2 = Apr 1, Q3 = Jul 1, Q4 = Oct 1
        const month = (q - 1) * 3;
        return parseISO(`${qYear}-${(month + 1).toString().padStart(2, '0')}-01`);

      case 'year':
        // "2026" → Jan 1 of that year
        return parseISO(`${key}-01-01`);

      default:
        return new Date();
    }
  }

  /**
   * Get a date from an offset relative to a base date (or today if not provided)
   */
  private getDateFromOffset(offset: number, scope: PeriodScope, baseDate: Date = this.today): Date {
    switch (scope) {
      case 'day':
        // Day is already normalized by startOfDay in constructor
        return addDays(baseDate, offset);

      case 'week':
        // Normalize to Monday of the current week, then add offset weeks
        const weekStart = startOfISOWeek(baseDate);
        return addWeeks(weekStart, offset);

      case 'quarter':
        // Normalize to start of current quarter, then add offset quarters
        const quarterStart = startOfQuarter(baseDate);
        return addQuarters(quarterStart, offset);

      case 'year':
        // Normalize to Jan 1 of current year, then add offset years
        const yearStart = parseISO(`${getYear(baseDate)}-01-01`);
        return addYears(yearStart, offset);

      default:
        return baseDate;
    }
  }
}
