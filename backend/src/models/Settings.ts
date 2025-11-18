export interface UserSettings {
  id: string;
  userId: string;
  currency: string;
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettingsInput {
  userId: string;
  currency?: string;
  theme?: 'light' | 'dark';
  notificationsEnabled?: boolean;
  language?: string;
}