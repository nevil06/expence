import { Request, Response } from 'express';
import { getFirestore } from '../utils/firebase';
import { Category, CategoryInput } from '../models/Category';
import { categoryValidationSchema } from '../utils/validation';

// Get all categories for a user
export const getCategories = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || (req as any).userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const snapshot = await getFirestore()
      .collection('categories')
      .where('userId', '==', userId)
      .orderBy('name', 'asc')
      .get();

    const categories: Category[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      categories.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Category);
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single category
export const getCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const doc = await getFirestore().collection('categories').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const categoryData = doc.data();
    if (categoryData.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to category' });
    }

    const category = {
      id: doc.id,
      ...categoryData,
      createdAt: categoryData.createdAt.toDate(),
      updatedAt: categoryData.updatedAt.toDate(),
    } as Category;

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { error, value } = categoryValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = (req as any).userId;
    const { name, icon, color }: CategoryInput = value;

    // Check if user exists
    const userDoc = await getFirestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newCategory: Category = {
      id: '',
      userId,
      name,
      icon,
      color,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await getFirestore().collection('categories').add(newCategory);

    res.status(201).json({
      id: docRef.id,
      ...newCategory,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { error, value } = categoryValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { id } = req.params;
    const userId = (req as any).userId;
    const { name, icon, color }: CategoryInput = value;

    // Check if category belongs to user
    const categoryDoc = await getFirestore().collection('categories').doc(id).get();
    if (!categoryDoc.exists) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const categoryData = categoryDoc.data();
    if (categoryData.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to category' });
    }

    const updateData = {
      name,
      icon,
      color,
      updatedAt: new Date(),
    };

    await getFirestore().collection('categories').doc(id).update(updateData);

    res.json({
      id,
      userId,
      ...updateData,
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    // Check if category belongs to user
    const categoryDoc = await getFirestore().collection('categories').doc(id).get();
    if (!categoryDoc.exists) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const categoryData = categoryDoc.data();
    if (categoryData.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to category' });
    }

    // Check if there are any expenses associated with this category
    const expensesSnapshot = await getFirestore()
      .collection('expenses')
      .where('categoryId', '==', id)
      .limit(1)
      .get();

    if (!expensesSnapshot.empty) {
      return res.status(400).json({ error: 'Cannot delete category with associated expenses' });
    }

    await getFirestore().collection('categories').doc(id).delete();

    res.status(204).send();
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};