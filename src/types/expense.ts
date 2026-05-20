import type { RecurrenceType } from './common.ts';

export type Expense = {
  uuid: string;
  amount: number;
  date: string;       // ISO formát
  category: string;
  note?: string;
  location?: string;
  recurrence: RecurrenceType;
  recurringGroupId?: string;
}