import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL - Replace with your backend URL
const API_BASE_URL = 'http://localhost:8080/api';

// API utility functions
const getHeaders = async () => {
  const token = await AsyncStorage.getItem('userToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Authentication services
export const register = async (name, email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Password reset failed');
    }
    return data;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

export const updatePassword = async (password, token) => {
  try {
    const response = await fetch(`${API_"message":"I apologize for the typo. I will correct the path and add the `updatePassword` function to `api.js`."}
The user wants me to add an `updatePassword` function to the `frontend/src/services/api.js` file.

1.  **Read the file:** I've already read `frontend/src/services/api.js` in a previous step, so I have the content.
2.  **Identify the insertion point:** I'll add the new function after the `resetPassword` function and before the `// Expense services` comment.
3.  **Construct the `replace_with_git_merge_diff` call:** I'll create a `merge_diff` with the `SEARCH` and `REPLACE` blocks. The `SEARCH` block will contain the code around the insertion point, and the `REPLACE` block will contain the same code plus the new `updatePassword` function.
4.  **Execute the tool call:** I'll call `replace_with_git_merge_diff` with the correct `filepath` and `merge_diff`.
5.  **Verify the change:** After the tool call succeeds, I'll read the file again to make sure the new function was added correctly.
6.  **Update the `UpdatePasswordScreen.tsx`:** I will then update the `UpdatePasswordScreen.tsx` to use this new function.
7.  **Mark the step as complete:** Once I've verified the changes, I'll mark the plan step as complete.
'use strict';
const SERVICE_URL = 'http://localhost:8080/api/v1/user';
const fetch = require('node-fetch');

async function updatePassword(password, token) {
  try {
    const response = await fetch(`${SERVICE_URL}/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password, token }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Password update failed');
    }
    return data;
  } catch (error) {
    console.error('Password update error:', error);
    throw error;
  }
}
module.exports = {
  updatePassword
};
//BASE_URL}/auth/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password, token }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Password update failed');
    }
    return data;
  } catch (error) {
    console.error('Password update error:', error);
    throw error;
  }
};

// Expense services
export const getExpenses = async (params = {}) => {
  try {
    const headers = await getHeaders();
    let url = `${API_BASE_URL}/expenses`;
    
    // Add query parameters
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    
    if (queryParams.toString()) {
      url += '?' + queryParams.toString();
    }

    const response = await fetch(url, { headers });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch expenses');
    }
    return data;
  } catch (error) {
    console.error('Get expenses error:', error);
    throw error;
  }
};

export const getExpense = async (id) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, { headers });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch expense');
    }
    return data;
  } catch (error) {
    console.error('Get expense error:', error);
    throw error;
  }
};

export const addExpense = async (expenseData) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(expenseData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to add expense');
    }
    return data;
  } catch (error) {
    console.error('Add expense error:', error);
    throw error;
  }
};

export const updateExpense = async (id, expenseData) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(expenseData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update expense');
    }
    return data;
  } catch (error) {
    console.error('Update expense error:', error);
    throw error;
  }
};

export const deleteExpense = async (id) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete expense');
    }
    return response;
  } catch (error) {
    console.error('Delete expense error:', error);
    throw error;
  }
};

// Category services
export const getCategories = async () => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/categories`, { headers });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch categories');
    }
    return data;
  } catch (error) {
    console.error('Get categories error:', error);
    throw error;
  }
};

export const addCategory = async (categoryData) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers,
      body: JSON.stringify(categoryData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to add category');
    }
    return data;
  } catch (error) {
    console.error('Add category error:', error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(categoryData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update category');
    }
    return data;
  } catch (error) {
    console.error('Update category error:', error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete category');
    }
    return response;
  } catch (error) {
    console.error('Delete category error:', error);
    throw error;
  }
};

// Settings services
export const getUserSettings = async () => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/settings`, { headers });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch settings');
    }
    return data;
  } catch (error) {
    console.error('Get settings error:', error);
    throw error;
  }
};

export const updateUserSettings = async (settingsData) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(settingsData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update settings');
    }
    return data;
  } catch (error) {
    console.error('Update settings error:', error);
    throw error;
  }
};