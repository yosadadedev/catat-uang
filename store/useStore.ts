import { create } from 'zustand';
import { Transaction, Category, DatabaseManager } from '../database/database';

interface FinanceState {
  // State
  transactions: Transaction[];
  categories: Category[];
  balance: {
    total: number;
    income: number;
    expense: number;
  };
  loading: boolean;
  error: string | null;

  // Database instance
  db: DatabaseManager | null;

  // Actions
  initializeApp: () => Promise<void>;

  // Transaction actions
  loadTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: number, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;

  // Category actions
  loadCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: number, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;

  // Utility actions
  calculateBalance: () => void;
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];
  getRecentTransactions: (limit?: number) => Transaction[];
  getTransactionsByCategory: (categoryId: number) => Transaction[];
  getMonthlyTransactions: (year: number, month: number) => Transaction[];
  resetAllData: () => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  // Initial state
  transactions: [],
  categories: [],
  balance: {
    total: 0,
    income: 0,
    expense: 0,
  },
  loading: false,
  error: null,
  db: null,

  // Initialize app
  initializeApp: async () => {
    const { db, loading } = get();

    // Prevent multiple initialization
    if (db || loading) return;

    set({ loading: true, error: null });
    try {
      // Initialize database
      const newDb = new DatabaseManager();
      await newDb.init();
      set({ db: newDb });

      // Load data
      await get().loadCategories();
      await get().loadTransactions();
      get().calculateBalance();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to initialize app' });
    } finally {
      set({ loading: false });
    }
  },

  // Transaction actions
  loadTransactions: async () => {
    const { db } = get();
    if (!db) return;

    try {
      const transactions = await db.getTransactions();
      set({ transactions });
    } catch (error) {
      console.error('Failed to load transactions:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load transactions' });
    }
  },

  addTransaction: async (transaction) => {
    const { db } = get();
    if (!db) return;

    try {
      const id = await db.addTransaction(transaction);
      const newTransaction: Transaction = {
        ...transaction,
        id,
      };
      set((state) => ({
        transactions: [...state.transactions, newTransaction],
      }));
      get().calculateBalance();
    } catch (error) {
      console.error('Failed to add transaction:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to add transaction' });
    }
  },

  updateTransaction: async (id, updates) => {
    const { db } = get();
    if (!db) return;

    try {
      await db.updateTransaction(id, updates);
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }));
      get().calculateBalance();
    } catch (error) {
      console.error('Failed to update transaction:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update transaction' });
    }
  },

  deleteTransaction: async (id) => {
    const { db } = get();
    if (!db) return;

    try {
      await db.deleteTransaction(id);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
      get().calculateBalance();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete transaction' });
    }
  },

  // Category actions
  loadCategories: async () => {
    const { db } = get();
    if (!db) return;

    try {
      const categories = await db.getCategories();
      set({ categories });
    } catch (error) {
      console.error('Failed to load categories:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load categories' });
    }
  },

  addCategory: async (category) => {
    const { db } = get();
    if (!db) return;

    try {
      const id = await db.addCategory(category);
      const newCategory: Category = {
        ...category,
        id,
      };
      set((state) => ({
        categories: [...state.categories, newCategory],
      }));
    } catch (error) {
      console.error('Failed to add category:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to add category' });
    }
  },

  updateCategory: async (id, updates) => {
    const { db } = get();
    if (!db) return;

    try {
      await db.updateCategory(id, updates);
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      }));
    } catch (error) {
      console.error('Failed to update category:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update category' });
    }
  },

  deleteCategory: async (id) => {
    const { db } = get();
    if (!db) return;

    try {
      await db.deleteCategory(id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete category:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete category' });
    }
  },

  // Utility actions
  calculateBalance: () => {
    const { transactions } = get();
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    set({
      balance: {
        total: income - expense,
        income,
        expense,
      },
    });
  },

  getTransactionsByDateRange: (startDate, endDate) => {
    const { transactions } = get();
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return transactionDate >= start && transactionDate <= end;
    });
  },

  getRecentTransactions: (limit = 10) => {
    const { transactions } = get();
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  },

  getTransactionsByCategory: (categoryId) => {
    const { transactions } = get();
    return transactions.filter((t) => t.category_id === categoryId);
  },

  getMonthlyTransactions: (year, month) => {
    const { transactions } = get();
    return transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  },

  resetAllData: async () => {
    const { db } = get();
    if (!db) return;

    try {
      set({ loading: true, error: null });

      // Delete all transactions
      const transactions = await db.getTransactions();
      for (const transaction of transactions) {
        if (transaction.id) {
          await db.deleteTransaction(transaction.id);
        }
      }

      // Delete all categories
      const categories = await db.getCategories();
      for (const category of categories) {
        if (category.id) {
          await db.deleteCategory(category.id);
        }
      }

      // Reinitialize with default categories
      await db.init();

      // Reload data
      await get().loadCategories();
      await get().loadTransactions();
      get().calculateBalance();
    } catch (error) {
      console.error('Failed to reset data:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to reset data' });
    } finally {
      set({ loading: false });
    }
  },
}));
