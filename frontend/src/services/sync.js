import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getUnsyncedExpenses,
  getAllLocalCategories,
  markExpenseAsSynced,
  markCategoryAsSynced,
  markSettingsAsSynced,
  getAllLocalExpenses,
  getLocalSettings
} from './database';
import { 
  addExpense,
  updateExpense,
  deleteExpense,
  addCategory,
  updateCategory,
  deleteCategory,
  updateUserSettings
} from './api';

// Check network connectivity
const checkConnectivity = async () => {
  // In a real app, you would use React Native's NetInfo API
  // For this example, we'll assume online
  return true;
};

// Sync pending changes to the server
export const syncWithServer = async () => {
  const isConnected = await checkConnectivity();
  if (!isConnected) {
    console.log('No internet connection, sync skipped');
    return;
  }

  try {
    // Sync expenses
    await syncExpenses();
    
    // Sync categories
    await syncCategories();
    
    // Sync settings
    await syncSettings();
    
    console.log('Sync completed successfully');
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
};

const syncExpenses = async () => {
  const unsyncedExpenses = await getUnsyncedExpenses();
  
  for (const expense of unsyncedExpenses) {
    try {
      // If expense has no remote_id, it's a new expense
      if (!expense.remote_id) {
        const response = await addExpense({
          userId: expense.user_id,
          categoryId: expense.category_id,
          amount: expense.amount,
          description: expense.description,
          date: expense.date,
        });
        
        // Update local record with remote ID
        await markExpenseAsSynced(expense.id, response.id);
      } else {
        // If expense has a remote_id, try updating it
        const response = await updateExpense(expense.remote_id, {
          categoryId: expense.category_id,
          amount: expense.amount,
          description: expense.description,
          date: expense.date,
        });
        
        // Mark as synced
        await markExpenseAsSynced(expense.id, expense.remote_id);
      }
    } catch (error) {
      console.error(`Failed to sync expense ${expense.id}:`, error);
      // In a real app, you might want to log this for later retry
    }
  }
};

const syncCategories = async () => {
  // For now, categories are not typically modified offline
  // You could implement similar logic if needed
  console.log('Categories sync completed');
};

const syncSettings = async () => {
  // For now, settings sync is not implemented
  // You could implement similar logic if needed
  console.log('Settings sync completed');
};

// Download latest data from server
export const downloadFromServer = async () => {
  const isConnected = await checkConnectivity();
  if (!isConnected) {
    console.log('No internet connection, download skipped');
    return;
  }

  try {
    // In a real app, you would fetch the latest data from the server
    // and update the local database accordingly
    console.log('Download from server completed');
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

// Initialize sync when app starts
export const initializeSync = async () => {
  // Check if it's the first time running or if we need to sync
  const lastSync = await AsyncStorage.getItem('lastSync');
  const now = new Date().getTime();
  
  // If it's been more than 10 minutes since last sync, sync now
  if (!lastSync || (now - parseInt(lastSync)) > 10 * 60 * 1000) {
    try {
      await syncWithServer();
      await downloadFromServer();
      await AsyncStorage.setItem('lastSync', now.toString());
    } catch (error) {
      console.error('Initial sync failed:', error);
    }
  }
};