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
    if (!settingsData) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    const settings = {
      id: settingsDoc.id,
      userId: settingsData.userId,
      currency: settingsData.currency,
      theme: settingsData.theme,
      notificationsEnabled: settingsData.notificationsEnabled,
      language: settingsData.language,
      createdAt: settingsData.createdAt instanceof Date ? settingsData.createdAt : (settingsData.createdAt as any).toDate(),
      updatedAt: settingsData.updatedAt instanceof Date ? settingsData.updatedAt : (settingsData.updatedAt as any).toDate(),
    } as UserSettings;

    return res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    return res.status(500).json({ error: 'Internal server error' });
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

    // Get the updated document to return fresh data
    const updatedSettingsDoc = await getFirestore().collection('settings').doc(settingsDoc.id).get();
    if (!updatedSettingsDoc.exists) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    const updatedSettingsData = updatedSettingsDoc.data();
    if (!updatedSettingsData) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    const response = {
      id: settingsDoc.id,
      userId: updatedSettingsData.userId,
      currency: updatedSettingsData.currency,
      theme: updatedSettingsData.theme,
      notificationsEnabled: updatedSettingsData.notificationsEnabled,
      language: updatedSettingsData.language,
      createdAt: updatedSettingsData.createdAt instanceof Date ? updatedSettingsData.createdAt : (updatedSettingsData.createdAt as any).toDate(),
      updatedAt: updatedSettingsData.updatedAt instanceof Date ? updatedSettingsData.updatedAt : (updatedSettingsData.updatedAt as any).toDate(),
    };

    return res.json(response);
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};