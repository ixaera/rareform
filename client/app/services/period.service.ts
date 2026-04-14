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
    return this.scopeConfig[scope].label(date);
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
    return this.scopeConfig[scope].dateRange(date);
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
   * Get the year offset from the current year for a given quarter key
   */
  getYearOffsetForQuarterKey(quarterKey: string): number {
    const quarterYear = parseInt(quarterKey.split('-Q')[0], 10);
    return quarterYear - getYear(this.today);
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

  // Scope-specific formatting, parsing, and offset logic — defined once, used everywhere.
  private readonly scopeConfig: Record<PeriodScope, {
    formatKey: (date: Date) => string;
    parseKey: (key: string) => Date;
    offsetDate: (base: Date, offset: number) => Date;
    dateRange: (date: Date) => DateRange;
    label: (date: Date) => string;
  }> = {
    day: {
      formatKey: (date) => format(date, 'yyyy-MM-dd'),
      parseKey: (key) => parseISO(key),
      offsetDate: (base, offset) => addDays(base, offset),
      dateRange: (date) => ({ start: startOfDay(date), end: startOfDay(date) }),
      label: (date) => format(date, 'EEEE, MMM d'),
    },
    week: {
      // "2026-W05"
      formatKey: (date) => {
        const year = getYear(date);
        const week = getISOWeek(date);
        return `${year}-W${week.toString().padStart(2, '0')}`;
      },
      // "2026-W05" → Monday of that week
      // Jan 4 is always in ISO week 1, so we use it as an anchor.
      parseKey: (key) => {
        const [yearStr, weekStr] = key.split('-W');
        const jan4 = parseISO(`${yearStr}-01-04`);
        return addWeeks(startOfISOWeek(jan4), parseInt(weekStr, 10) - 1);
      },
      offsetDate: (base, offset) => addWeeks(startOfISOWeek(base), offset),
      dateRange: (date) => ({ start: startOfISOWeek(date), end: endOfISOWeek(date) }),
      label: (date) => `Week of ${format(startOfISOWeek(date), 'MMM d')}`,
    },
    quarter: {
      // "2026-Q1"
      formatKey: (date) => `${getYear(date)}-Q${getQuarter(date)}`,
      // "2026-Q1" → Jan 1, "2026-Q2" → Apr 1, etc.
      parseKey: (key) => {
        const [qYearStr, qStr] = key.split('-Q');
        const month = (parseInt(qStr, 10) - 1) * 3;
        return parseISO(`${qYearStr}-${(month + 1).toString().padStart(2, '0')}-01`);
      },
      offsetDate: (base, offset) => addQuarters(startOfQuarter(base), offset),
      dateRange: (date) => ({ start: startOfQuarter(date), end: endOfQuarter(date) }),
      label: (date) => `Quarter ${getQuarter(date)}`,
    },
    year: {
      // "2026"
      formatKey: (date) => format(date, 'yyyy'),
      parseKey: (key) => parseISO(`${key}-01-01`),
      offsetDate: (base, offset) => addYears(parseISO(`${getYear(base)}-01-01`), offset),
      dateRange: (date) => ({
        start: parseISO(`${getYear(date)}-01-01`),
        end: parseISO(`${getYear(date)}-12-31`),
      }),
      label: (date) => `${format(date, 'yyyy')} Goals`,
    },
  };

  private formatPeriodKey(date: Date, scope: PeriodScope): string {
    return this.scopeConfig[scope].formatKey(date);
  }

  private parsePeriodKey(key: string, scope: PeriodScope): Date {
    return this.scopeConfig[scope].parseKey(key);
  }

  private getDateFromOffset(offset: number, scope: PeriodScope, baseDate: Date = this.today): Date {
    return this.scopeConfig[scope].offsetDate(baseDate, offset);
  }
}
