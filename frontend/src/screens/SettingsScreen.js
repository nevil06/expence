import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Card, Title, Paragraph, Button, Switch } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserSettings, updateUserSettings } from '../services/api';

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    currency: 'USD',
    theme: 'light',
    notificationsEnabled: true,
    language: 'en',
  });
  const [originalSettings, setOriginalSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    loadSettings();
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    if (Platform.OS === 'web' && settings.theme) {
      applyTheme(settings.theme);
    }
  }, [settings.theme]);

  const applyTheme = (theme) => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.body.style.backgroundColor = '#1a1a1a';
        document.body.style.color = '#ffffff';
      } else {
        document.body.style.backgroundColor = '#f5f5f5';
        document.body.style.color = '#000000';
      }
    }
  };

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settingsResponse = await getUserSettings();
      if (settingsResponse) {
        const loadedSettings = {
          currency: settingsResponse.currency || 'USD',
          theme: settingsResponse.theme || 'light',
          notificationsEnabled: settingsResponse.notifications !== undefined ? settingsResponse.notifications : true,
          language: settingsResponse.language || 'en',
        };
        setSettings(loadedSettings);
        setOriginalSettings({ ...loadedSettings });
        applyTheme(loadedSettings.theme);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use default settings if API fails
      const defaultSettings = {
        currency: 'USD',
        theme: 'light',
        notificationsEnabled: true,
        language: 'en',
      };
      setSettings(defaultSettings);
      setOriginalSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateUserSettings(settings);
      showMessage('Settings updated successfully!', 'success');
      setOriginalSettings({ ...settings });

      // Save theme preference to AsyncStorage
      await AsyncStorage.setItem('theme', settings.theme);
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage(error.message || 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    setSettings({ ...originalSettings });
    showMessage('Settings reset to original values', 'success');
  };

  const handleLogout = async () => {
    const confirmed = confirm('Are you sure you want to logout?');
    if (confirmed) {
      try {
        await AsyncStorage.removeItem('userToken');
        showMessage('Logged out successfully!', 'success');

        // Reload page to go back to login
        setTimeout(() => {
          if (Platform.OS === 'web') {
            window.location.reload();
          }
        }, 1000);
      } catch (error) {
        console.error('Error logging out:', error);
        showMessage('Failed to log out', 'error');
      }
    }
  };

  const currencies = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'JPY', label: 'Japanese Yen (JPY)' },
    { value: 'CAD', label: 'Canadian Dollar (CAD)' },
    { value: 'AUD', label: 'Australian Dollar (AUD)' },
    { value: 'INR', label: 'Indian Rupee (INR)' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'hi', label: 'Hindi' },
  ];

  const isDark = settings.theme === 'dark';
  const dynamicStyles = getDynamicStyles(isDark);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, dynamicStyles.container]}>
        <Text style={dynamicStyles.text}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]}>
      <View style={[styles.header, dynamicStyles.header]}>
        <Title style={dynamicStyles.title}>Settings</Title>
      </View>

      {message ? (
        <View style={[styles.messageContainer, messageType === 'success' ? styles.successContainer : styles.errorContainer]}>
          <Text style={messageType === 'success' ? styles.successText : styles.errorText}>{message}</Text>
        </View>
      ) : null}

      <Card style={[styles.settingsCard, dynamicStyles.card]}>
        <Card.Content>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, dynamicStyles.text]}>Currency</Text>
            <View style={[styles.pickerContainer, dynamicStyles.pickerContainer]}>
              <Picker
                selectedValue={settings.currency}
                onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}
                style={[styles.picker, dynamicStyles.picker]}
              >
                {currencies.map((currency) => (
                  <Picker.Item key={currency.value} label={currency.label} value={currency.value} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, dynamicStyles.text]}>Theme</Text>
            <View style={[styles.pickerContainer, dynamicStyles.pickerContainer]}>
              <Picker
                selectedValue={settings.theme}
                onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}
                style={[styles.picker, dynamicStyles.picker]}
              >
                <Picker.Item label="Light" value="light" />
                <Picker.Item label="Dark" value="dark" />
              </Picker>
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, dynamicStyles.text]}>Language</Text>
            <View style={[styles.pickerContainer, dynamicStyles.pickerContainer]}>
              <Picker
                selectedValue={settings.language}
                onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
                style={[styles.picker, dynamicStyles.picker]}
              >
                {languages.map((language) => (
                  <Picker.Item key={language.value} label={language.label} value={language.value} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, dynamicStyles.text]}>Notifications</Text>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(value) => setSettings(prev => ({ ...prev, notificationsEnabled: value }))}
            />
          </View>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          style={styles.saveButton}
          onPress={handleSaveSettings}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>

        <Button
          mode="outlined"
          style={styles.resetButton}
          onPress={handleResetSettings}
          textColor={isDark ? '#fff' : '#007AFF'}
        >
          Reset
        </Button>
      </View>

      <View style={styles.logoutContainer}>
        <Button
          mode="contained"
          style={styles.logoutButton}
          onPress={handleLogout}
          buttonColor="#FF3B30"
        >
          Logout
        </Button>
      </View>

      <View style={[styles.exportContainer, dynamicStyles.card]}>
        <Title style={[styles.exportTitle, dynamicStyles.text]}>Data Export</Title>
        <Paragraph style={[styles.exportDescription, dynamicStyles.secondaryText]}>
          Export your expense data as a CSV file for backup or analysis.
        </Paragraph>
        <Button
          mode="outlined"
          style={styles.exportButton}
          textColor={isDark ? '#fff' : '#007AFF'}
        >
          Export as CSV
        </Button>
      </View>
    </ScrollView>
  );
};

const getDynamicStyles = (isDark) => ({
  container: {
    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
  },
  header: {
    backgroundColor: isDark ? '#2a2a2a' : '#fff',
  },
  card: {
    backgroundColor: isDark ? '#2a2a2a' : '#fff',
  },
  text: {
    color: isDark ? '#fff' : '#000',
  },
  secondaryText: {
    color: isDark ? '#aaa' : '#666',
  },
  title: {
    color: isDark ? '#fff' : '#000',
  },
  pickerContainer: {
    borderColor: isDark ? '#444' : '#ddd',
    backgroundColor: isDark ? '#333' : '#fff',
  },
  picker: {
    color: isDark ? '#fff' : '#000',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  messageContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  successContainer: {
    backgroundColor: '#efe',
    borderColor: '#cfc',
  },
  successText: {
    color: '#3c3',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderColor: '#fcc',
  },
  errorText: {
    color: '#c33',
    fontSize: 14,
    textAlign: 'center',
  },
  settingsCard: {
    margin: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    width: '60%',
    borderWidth: 1,
    borderRadius: 4,
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  saveButton: {
    flex: 1,
  },
  resetButton: {
    flex: 1,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logoutButton: {
    justifyContent: 'center',
  },
  exportContainer: {
    margin: 20,
    padding: 15,
    borderRadius: 8,
  },
  exportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exportDescription: {
    marginBottom: 15,
  },
  exportButton: {
    alignSelf: 'flex-start',
  },
});

export default SettingsScreen;