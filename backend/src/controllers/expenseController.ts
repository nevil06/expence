import { Request, Response } from 'express';
import { getFirestore } from '../utils/firebase';
import { Expense, ExpenseInput } from '../models/Expense';
import { expenseValidationSchema } from '../utils/validation';

// Get expenses with pagination
export const getExpenses = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const categoryId = req.query.categoryId as string;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    let query = getFirestore()
      .collection('expenses')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    // Apply date filters if provided
    if (startDate) {
      query = query.where('date', '>=', new Date(startDate));
    }
    if (endDate) {
      query = query.where('date', '<=', new Date(endDate));
    }
    if (categoryId) {
      query = query.where('categoryId', '==', categoryId);
    }

    const snapshot = await query.get();
    const expenses: Expense[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      expenses.push({
        id: doc.id,
        ...data,
        date: data.date instanceof Date ? data.date : (data.date as any).toDate(),
        createdAt: data.createdAt instanceof Date ? data.createdAt : (data.createdAt as any).toDate(),
        updatedAt: data.updatedAt instanceof Date ? data.updatedAt : (data.updatedAt as any).toDate(),
      } as Expense);
    });

    // Get total count for pagination
    let countQuery = getFirestore()
      .collection('expenses')
      .where('userId', '==', userId);

    if (startDate) {
      countQuery = countQuery.where('date', '>=', new Date(startDate));
    }
    if (endDate) {
      countQuery = countQuery.where('date', '<=', new Date(endDate));
    }
    if (categoryId) {
      countQuery = countQuery.where('categoryId', '==', categoryId);
    }

    const countSnapshot = await countQuery.get();
    const totalCount = countSnapshot.size;

    return res.json({
      expenses,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single expense
export const getExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const doc = await getFirestore().collection('expenses').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const expenseData = doc.data();
    if (!expenseData || expenseData.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to expense' });
    }

    const expense = {
      id: doc.id,
      userId: expenseData.userId,
      categoryId: expenseData.categoryId,
      amount: expenseData.amount,
      description: expenseData.description,
      date: expenseData.date instanceof Date ? expenseData.date : (expenseData.date as any).toDate(),
      createdAt: expenseData.createdAt instanceof Date ? expenseData.createdAt : (expenseData.createdAt as any).toDate(),
      updatedAt: expenseData.updatedAt instanceof Date ? expenseData.updatedAt : (expenseData.updatedAt as any).toDate(),
    } as Expense;

    return res.json(expense);
  } catch (error) {
    console.error('Get expense error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new expense
export const createExpense = async (req: Request, res: Response) => {
  try {
    const { error, value } = expenseValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = (req as any).userId;
    const { categoryId, amount, description, date }: ExpenseInput = value;

    // Verify user and category belong to the same user
    const userDoc = await getFirestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const categoryDoc = await getFirestore().collection('categories').doc(categoryId).get();
    if (!categoryDoc.exists || categoryDoc.data()?.userId !== userId) {
      return res.status(404).json({ error: 'Category not found or does not belong to user' });
    }

    const newExpense: Expense = {
      id: '',
      userId,
      categoryId,
      amount,
      description,
      date: new Date(date),
      createdAt: new Date(),
      updatedAt: new Date(),
      isSynced: true, // New expenses are synced by default
    };

    const docRef = await getFirestore().collection('expenses').add(newExpense);

    const createdExpense = { ...newExpense, id: docRef.id };

    return res.status(201).json(createdExpense);
  } catch (error) {
    console.error('Create expense error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update an expense
export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { error, value } = expenseValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { id } = req.params;
    const userId = (req as any).userId;
    const { categoryId, amount, description, date }: ExpenseInput = value;

    // Check if expense belongs to user
    const expenseDoc = await getFirestore().collection('expenses').doc(id).get();
    if (!expenseDoc.exists) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const expenseData = expenseDoc.data();
    if (!expenseData || expenseData.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to expense' });
    }

    // Verify category belongs to the same user
    const categoryDoc = await getFirestore().collection('categories').doc(categoryId).get();
    if (!categoryDoc.exists || categoryDoc.data()?.userId !== userId) {
      return res.status(404).json({ error: 'Category not found or does not belong to user' });
    }

    const updateData = {
      categoryId,
      amount,
      description,
      date: new Date(date),
      updatedAt: new Date(),
      isSynced: false, // Mark as unsynced for offline sync
    };

    await getFirestore().collection('expenses').doc(id).update(updateData);

    return res.json({
      id: expenseDoc.id,
      userId,
      categoryId,
      amount,
      description,
      date: updateData.date,
      updatedAt: updateData.updatedAt,
      isSynced: updateData.isSynced,
    });
  } catch (error) {
    console.error('Update expense error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete an expense
export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    // Check if expense belongs to user
    const expenseDoc = await getFirestore().collection('expenses').doc(id).get();
    if (!expenseDoc.exists) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const expenseData = expenseDoc.data();
    if (!expenseData || expenseData.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to expense' });
    }

    await getFirestore().collection('expenses').doc(id).delete();

    return res.status(204).send();
  } catch (error) {
    console.error('Delete expense error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};