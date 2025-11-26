import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getFirestore } from '../utils/firebase';
import { User, UserInput } from '../models/User';
import { userValidationSchema, loginValidationSchema } from '../utils/validation';
import { DeviceUUID } from 'device-uuid';

export const register = async (req: Request, res: Response) => {
  try {
    // Validate input
    const { error, value } = userValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, name }: UserInput = value;

    // Check if user already exists
    const existingUser = await getFirestore()
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user document
    const newUser: User = {
      id: '',
      email,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add user to Firestore
    const docRef = await getFirestore().collection('users').add({
      ...newUser,
      password: hashedPassword,
    });

    // Create default user settings
    await getFirestore().collection('settings').add({
      userId: docRef.id,
      currency: 'USD',
      theme: 'light',
      notificationsEnabled: true,
      language: 'en',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create default categories
    const defaultCategories = [
      { name: 'Food & Dining', icon: 'restaurant', color: '#FF6B6B' },
      { name: 'Transportation', icon: 'directions-car', color: '#4ECDC4' },
      { name: 'Shopping', icon: 'shopping-cart', color: '#45B7D1' },
      { name: 'Entertainment', icon: 'local-movies', color: '#FFBE0B' },
      { name: 'Healthcare', icon: 'local-hospital', color: '#FB5607' },
      { name: 'Utilities', icon: 'home', color: '#8338EC' },
    ];

    const batch = getFirestore().batch();
    for (const category of defaultCategories) {
      const categoryRef = getFirestore().collection('categories').doc();
      batch.set(categoryRef, {
        userId: docRef.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    await batch.commit();

    // Generate JWT token
    const token = jwt.sign(
      { userId: docRef.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Return user without password
    const userResponse = {
      id: docRef.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
      token,
    };

    return res.status(201).json(userResponse);
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    // Find the password reset token
    const resetTokenSnapshot = await getFirestore()
      .collection('passwordResets')
      .where('token', '==', token)
      .limit(1)
      .get();

    if (resetTokenSnapshot.empty) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const resetTokenDoc = resetTokenSnapshot.docs[0];
    const resetToken = resetTokenDoc.data();

    // Check if the token has expired
    if (new Date() > resetToken.expires.toDate()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update the user's password
    await getFirestore().collection('users').doc(resetToken.userId).update({
      password: hashedPassword,
    });

    // Delete the password reset token
    await resetTokenDoc.ref.delete();

    return res.json({ message: 'Password updated successfully!' });
  } catch (error) {
    console.error('Password update error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find user
    const userSnapshot = await getFirestore()
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      // Return a success message even if the user doesn't exist to prevent email enumeration
      return res.json({ message: 'Password reset link sent successfully!' });
    }

    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;

    // Generate a password reset token
    const du = new DeviceUUID();
    const token = du.get();
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    // Store the token in a new 'passwordResets' collection
    await getFirestore().collection('passwordResets').add({
      userId,
      token,
      expires,
    });

    // In a real application, you would send an email to the user with the reset link
    const resetLink = `http://localhost:8081/update-password?token=${token}`;
    console.log(`Password reset link for ${email}: ${resetLink}`);

    return res.json({ message: 'Password reset link sent successfully!' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // Validate input
    const { error, value } = loginValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Find user
    const userSnapshot = await getFirestore()
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userDoc = userSnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() } as User & { password: string };

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Return user without password
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      token,
    };

    return res.json(userResponse);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};