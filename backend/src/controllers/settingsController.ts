import { Request, Response } from 'express';
import { getFirestore } from '../utils/firebase';
import { UserSettings, UserSettingsInput } from '../models/Settings';
import { settingsValidationSchema } from '../utils/validation';

// Get user settings
export const getUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Find settings for the user
    const settingsSnapshot = await getFirestore()
      .collection('settings')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (settingsSnapshot.empty) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    const settingsDoc = settingsSnapshot.docs[0];
    const settingsData = settingsDoc.data();

    const settings = {
      id: settingsDoc.id,
      ...settingsData,
      createdAt: settingsData.createdAt.toDate(),
      updatedAt: settingsData.updatedAt.toDate(),
    } as UserSettings;

    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user settings
export const updateUserSettings = async (req: Request, res: Response) => {
  try {
    const { error, value } = settingsValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = (req as any).userId;
    const { currency, theme, notificationsEnabled, language }: UserSettingsInput = value;

    // Find existing settings
    const settingsSnapshot = await getFirestore()
      .collection('settings')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (settingsSnapshot.empty) {
      // Create new settings if they don't exist
      const newSettings: UserSettings = {
        id: '',
        userId,
        currency: currency || 'USD',
        theme: theme || 'light',
        notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : true,
        language: language || 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await getFirestore().collection('settings').add(newSettings);

      return res.json({
        id: docRef.id,
        ...newSettings,
      });
    }

    const settingsDoc = settingsSnapshot.docs[0];
    const updateData: Partial<UserSettings> = {};

    if (currency !== undefined) updateData.currency = currency;
    if (theme !== undefined) updateData.theme = theme;
    if (notificationsEnabled !== undefined) updateData.notificationsEnabled = notificationsEnabled;
    if (language !== undefined) updateData.language = language;

    updateData.updatedAt = new Date();

    await getFirestore().collection('settings').doc(settingsDoc.id).update(updateData);

    res.json({
      id: settingsDoc.id,
      userId,
      ...settingsDoc.data(),
      ...updateData,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};