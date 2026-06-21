export type CategoryID = 'investment' | 'obligations' | 'entertainment' | 'savings';

export interface BudgetCategory {
  id: CategoryID;
  title: string;
  description: string;
  allocated: number; // monthly target allocation
  spent: number;     // amount used so far this month
  color: string;     // color tailwind class or hex
  icon: string;      // lucide icon name
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: CategoryID | 'income'; // 'income' for salary/profits or specific category for spending/allocation
  date: string;
  notes?: string;
  autoTracked?: boolean; // True if created by automated rules or interest accrual
}

export interface SavingsGoal {
  id: string;
  title: string;
  target: number;
  currentValue: number;
  deadline?: string;
}

export interface BudgetState {
  investment: BudgetCategory;
  obligations: BudgetCategory;
  entertainment: BudgetCategory;
  savings: BudgetCategory;
}
