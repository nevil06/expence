export interface Expense {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  isSynced?: boolean; // For offline sync tracking
}

export interface ExpenseInput {
  userId: string;
  categoryId: string;
  amount: number;
  description: string;
  date: Date;
}