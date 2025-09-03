import * as SQLite from 'expo-sqlite';

export interface Transaction {
  id?: number;
  type: 'income' | 'expense';
  amount: number;
  category_id: number;
  description: string;
  date: string;
  created_at?: string;
}

export interface Category {
  id?: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  created_at?: string;
}

export interface Settings {
  id?: number;
  key: string;
  value: string;
}

export class DatabaseManager {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitializing: boolean = false;
  private initPromise: Promise<void> | null = null;

  async init() {
    // Prevent multiple simultaneous initializations
    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }
    
    if (this.db) {
      return; // Already initialized
    }
    
    this.isInitializing = true;
    this.initPromise = this.performInit();
    
    try {
      await this.initPromise;
    } finally {
      this.isInitializing = false;
      this.initPromise = null;
    }
  }
  
  private async performInit() {
    let retries = 3;
    while (retries > 0) {
      try {
        // Close existing connection if any
        if (this.db) {
          try {
            await this.db.closeAsync();
          } catch (closeError) {
            console.warn('Error closing database:', closeError);
          }
          this.db = null;
        }
        
        // Add small delay to prevent race conditions
        await new Promise(resolve => setTimeout(resolve, 100));
        
        this.db = await SQLite.openDatabaseAsync('catat_uang.db');
        await this.createTables();
        await this.insertDefaultCategories();
        console.log('Database initialized successfully');
        return;
      } catch (error) {
        console.error(`Database initialization failed (attempt ${4 - retries}):`, error);
        this.db = null;
        retries--;
        
        if (retries > 0) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          throw error;
        }
      }
    }
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    // Create categories table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create transactions table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        amount REAL NOT NULL,
        category_id INTEGER NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      );
    `);

    // Create settings table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
      );
    `);
  }

  private async insertDefaultCategories() {
    if (!this.db) throw new Error('Database not initialized');

    // Check if categories already exist
    const result = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM categories');
    if ((result as any)?.count > 0) {
      // Update any existing 'shopping-bag' icons to 'bag'
      await this.db.runAsync(
        "UPDATE categories SET icon = 'bag' WHERE icon = 'shopping-bag'"
      );
      return;
    }

    // Default expense categories
    const expenseCategories = [
      { name: 'Makanan', icon: 'restaurant', color: '#FF6B6B' },
      { name: 'Transportasi', icon: 'car', color: '#4ECDC4' },
      { name: 'Belanja', icon: 'bag', color: '#45B7D1' },
      { name: 'Hiburan', icon: 'game-controller', color: '#96CEB4' },
      { name: 'Kesehatan', icon: 'medical', color: '#FFEAA7' },
      { name: 'Pendidikan', icon: 'school', color: '#DDA0DD' },
      { name: 'Tagihan', icon: 'receipt', color: '#98D8C8' },
      { name: 'Hobi', icon: 'heart', color: '#FF9FF3' },
      { name: 'Lainnya', icon: 'ellipsis-horizontal', color: '#F7DC6F' }
    ];

    // Default income categories
    const incomeCategories = [
      { name: 'Gaji', icon: 'wallet', color: '#2ECC71' },
      { name: 'Bonus', icon: 'gift', color: '#3498DB' },
      { name: 'Investasi', icon: 'trending-up', color: '#9B59B6' },
      { name: 'Freelance', icon: 'laptop', color: '#E67E22' },
      { name: 'Lainnya', icon: 'add-circle', color: '#1ABC9C' }
    ];

    // Insert expense categories
    for (const category of expenseCategories) {
      await this.db.runAsync(
        'INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)',
        [category.name, 'expense', category.icon, category.color]
      );
    }

    // Insert income categories
    for (const category of incomeCategories) {
      await this.db.runAsync(
        'INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)',
        [category.name, 'income', category.icon, category.color]
      );
    }
  }

  // Transaction methods
  async addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>) {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.runAsync(
      'INSERT INTO transactions (type, amount, category_id, description, date) VALUES (?, ?, ?, ?, ?)',
      [transaction.type, transaction.amount, transaction.category_id, transaction.description, transaction.date]
    );
    
    return result.lastInsertRowId;
  }

  async getTransactions(limit?: number): Promise<Transaction[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = limit 
      ? 'SELECT * FROM transactions ORDER BY date DESC, created_at DESC LIMIT ?'
      : 'SELECT * FROM transactions ORDER BY date DESC, created_at DESC';
    
    const params = limit ? [limit] : [];
    const result = await this.db.getAllAsync(query, params);
    
    return result as Transaction[];
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync(
      'SELECT * FROM transactions WHERE date BETWEEN ? AND ? ORDER BY date DESC',
      [startDate, endDate]
    );
    
    return result as Transaction[];
  }

  async updateTransaction(id: number, transaction: Partial<Transaction>) {
    if (!this.db) throw new Error('Database not initialized');
    
    const fields = Object.keys(transaction).filter(key => key !== 'id' && key !== 'created_at');
    const values = fields.map(field => transaction[field as keyof Transaction]).filter(value => value !== undefined);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    await this.db.runAsync(
      `UPDATE transactions SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }

  async deleteTransaction(id: number) {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
  }

  // Category methods
  async getCategories(type?: 'income' | 'expense'): Promise<Category[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = type 
      ? 'SELECT * FROM categories WHERE type = ? ORDER BY name'
      : 'SELECT * FROM categories ORDER BY type, name';
    
    const params = type ? [type] : [];
    const result = await this.db.getAllAsync(query, params);
    
    return result as Category[];
  }

  async addCategory(category: Omit<Category, 'id' | 'created_at'>) {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.runAsync(
      'INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)',
      [category.name, category.type, category.icon, category.color]
    );
    
    return result.lastInsertRowId;
  }

  async updateCategory(id: number, category: Partial<Category>) {
    if (!this.db) throw new Error('Database not initialized');
    
    const fields = Object.keys(category).filter(key => key !== 'id' && key !== 'created_at');
    const values = fields.map(field => category[field as keyof Category]).filter(value => value !== undefined);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    await this.db.runAsync(
      `UPDATE categories SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }

  async deleteCategory(id: number) {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
  }

  // Balance calculation
  async getBalance(): Promise<{ income: number; expense: number; balance: number }> {
    if (!this.db) throw new Error('Database not initialized');
    
    const incomeResult = await this.db.getFirstAsync(
      'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = "income"'
    );
    
    const expenseResult = await this.db.getFirstAsync(
      'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = "expense"'
    );
    
    const income = (incomeResult as any)?.total || 0;
    const expense = (expenseResult as any)?.total || 0;
    
    return {
      income,
      expense,
      balance: income - expense
    };
  }

  // Settings methods
  async getSetting(key: string): Promise<string | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getFirstAsync(
      'SELECT value FROM settings WHERE key = ?',
      [key]
    );
    
    return (result as any)?.value || null;
  }

  async setSetting(key: string, value: string) {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [key, value]
    );
  }
}

export const database = new DatabaseManager();