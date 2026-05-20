import type { Period } from './common.ts';

export type RecurrenceFilterType = 'all' | 'recurrent' | 'nonrecurrent';

export interface QuickFilters {
  period: Period;
  category: string; // 'all' nebo název kategorie
  recurrence: RecurrenceFilterType | 'all';
  onlyInPastOrNow: boolean;
  customDateRange: {
    from: string | null;
    to: string | null;
  };
}