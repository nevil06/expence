import * as SQLite from 'expo-sqlite';

// Initialize database
const db = SQLite.openDatabase('expense-manager.db');

// Create tables if they don't exist
export const initializeDatabase = () => {
  db.transaction((tx) => {
    // Create expenses table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id TEXT,
        user_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        is_synced INTEGER DEFAULT 0
      );`
    );

    // Create categories table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id TEXT,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        is_synced INTEGER DEFAULT 1
      );`
    );

    // Create settings table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id TEXT,
        user_id TEXT NOT NULL,
        currency TEXT DEFAULT 'USD',
        theme TEXT DEFAULT 'light',
        notifications_enabled INTEGER DEFAULT 1,
        language TEXT DEFAULT 'en',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        is_synced INTEGER DEFAULT 1
      );`
    );
  });
};

// Expense operations
export const addLocalExpense = (expense) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO expenses (user_id, category_id, amount, description, date, created_at, updated_at, is_synced)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            expense.userId,
            expense.categoryId,
            expense.amount,
            expense.description,
            new Date(expense.date).toISOString(),
            new Date().toISOString(),
            new Date().toISOString(),
            expense.isSynced ? 1 : 0,
          ],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const updateLocalExpense = (id, expense) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `UPDATE expenses 
           SET category_id = ?, amount = ?, description = ?, date = ?, updated_at = ?, is_synced = ?
           WHERE id = ?`,
          [
            expense.categoryId,
            expense.amount,
            expense.description,
            new Date(expense.date).toISOString(),
            new Date().toISOString(),
            expense.isSynced ? 1 : 0,
            id,
          ],
          (_, result) => resolve(result.rowsAffected),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const deleteLocalExpense = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `DELETE FROM expenses WHERE id = ?`,
          [id],
          (_, result) => resolve(result.rowsAffected),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const getAllLocalExpenses = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM expenses ORDER BY date DESC`,
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const getUnsyncedExpenses = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM expenses WHERE is_synced = 0`,
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

// Category operations
export const addLocalCategory = (category) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO categories (user_id, name, icon, color, created_at, updated_at, is_synced)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            category.userId,
            category.name,
            category.icon || null,
            category.color || null,
            new Date().toISOString(),
            new Date().toISOString(),
            1, // Categories are synced by default
          ],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const updateLocalCategory = (id, category) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `UPDATE categories 
           SET name = ?, icon = ?, color = ?, updated_at = ?, is_synced = ?
           WHERE id = ?`,
          [
            category.name,
            category.icon || null,
            category.color || null,
            new Date().toISOString(),
            0, // Mark as unsynced
            id,
          ],
          (_, result) => resolve(result.rowsAffected),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const deleteLocalCategory = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `DELETE FROM categories WHERE id = ?`,
          [id],
          (_, result) => resolve(result.rowsAffected),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const getAllLocalCategories = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM categories ORDER BY name ASC`,
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

// Settings operations
export const getLocalSettings = (userId) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM settings WHERE user_id = ?`,
          [userId],
          (_, { rows }) => resolve(rows._array[0] || null),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const updateLocalSettings = (userId, settings) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO settings 
           (user_id, currency, theme, notifications_enabled, language, created_at, updated_at, is_synced)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            settings.currency || 'USD',
            settings.theme || 'light',
            settings.notificationsEnabled ? 1 : 0,
            settings.language || 'en',
            settings.createdAt || new Date().toISOString(),
            new Date().toISOString(),
            0, // Mark as unsynced
          ],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

// Sync helpers
export const markExpenseAsSynced = (localId, remoteId) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `UPDATE expenses SET is_synced = 1, remote_id = ? WHERE id = ?`,
          [remoteId, localId],
          (_, result) => resolve(result.rowsAffected),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const markCategoryAsSynced = (localId, remoteId) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `UPDATE categories SET is_synced = 1, remote_id = ? WHERE id = ?`,
          [remoteId, localId],
          (_, result) => resolve(result.rowsAffected),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const markSettingsAsSynced = (localId, remoteId) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `UPDATE settings SET is_synced = 1, remote_id = ? WHERE id = ?`,
          [remoteId, localId],
          (_, result) => resolve(result.rowsAffected),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};