export type PaymentMethod =
  | "CASH"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "BANK_TRANSFER"
  | "UPI"
  | "OTHER";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currency: string;
  theme: string;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    expenses: number;
  };
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  type?: "EXPENSE" | "INCOME";
  expenseDate: string;
  notes?: string | null;
  paymentMethod: PaymentMethod;
  categoryId: string;
  category?: Category;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFilters {
  search?: string;
  categoryId?: string;
  paymentMethod?: PaymentMethod | "ALL";
  startDate?: string;
  endDate?: string;
  sortBy?: "expenseDate" | "amount" | "title";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface AnalyticsSummary {
  totalExpenses: number;
  totalIncome: number;
  remainingBalance: number;
  todaySpending: number;
  categoryBreakdown: {
    id: string;
    name: string;
    color: string;
    amount: number;
    percentage: number;
    count: number;
  }[];
  paymentMethodBreakdown?: {
    method: string;
    amount: number;
    percentage: number;
  }[];
  monthlyTrend: {
    month: string;
    amount: number;
  }[];
  topCategories: {
    id: string;
    name: string;
    color: string;
    amount: number;
  }[];
  highestExpense: Expense | null;
  averageDailySpending: number;
  monthOverMonth?: {
    currentMonth: number;
    previousMonth: number;
    changePercentage: number;
  };
  budgetHealthScore?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
