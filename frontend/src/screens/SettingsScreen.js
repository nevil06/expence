import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, TextInput, Switch, HelperText } from 'react-native-paper';
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

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settingsResponse = await getUserSettings();
      if (settingsResponse) {
        setSettings(settingsResponse);
        setOriginalSettings({ ...settingsResponse });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use default settings if API fails
      setSettings({
        currency: 'USD',
        theme: 'light',
        notificationsEnabled: true,
        language: 'en',
      });
      setOriginalSettings({
        currency: 'USD',
        theme: 'light',
        notificationsEnabled: true,
        language: 'en',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateUserSettings(settings);
      Alert.alert('Success', 'Settings updated successfully!');
      setOriginalSettings({ ...settings });
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    setSettings({ ...originalSettings });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      // In a real app, you might need to navigate to the login screen
      Alert.alert('Success', 'Logged out successfully!');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  const currencies = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'JPY', label: 'Japanese Yen (JPY)' },
    { value: 'CAD', label: 'Canadian Dollar (CAD)' },
    { value: 'AUD', label: 'Australian Dollar (AUD)' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Settings</Title>
      </View>

      <Card style={styles.settingsCard}>
        <Card.Content>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Currency</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={settings.currency}
                onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}
                style={styles.picker}
              >
                {currencies.map((currency) => (
                  <Picker.Item key={currency.value} label={currency.label} value={currency.value} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Theme</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={settings.theme}
                onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}
                style={styles.picker}
              >
                <Picker.Item label="Light" value="light" />
                <Picker.Item label="Dark" value="dark" />
              </Picker>
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Language</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={settings.language}
                onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
                style={styles.picker}
              >
                {languages.map((language) => (
                  <Picker.Item key={language.value} label={language.label} value={language.value} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Notifications</Text>
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
        >
          Reset to Original
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

      <View style={styles.exportContainer}>
        <Title style={styles.exportTitle}>Data Export</Title>
        <Paragraph style={styles.exportDescription}>
          Export your expense data as a CSV file for backup or analysis.
        </Paragraph>
        <Button 
          mode="outlined" 
          style={styles.exportButton}
        >
          Export as CSV
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsCard: {
    margin: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
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
    borderColor: '#ddd',
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
  },
  saveButton: {
    flex: 1,
    marginRight: 5,
  },
  resetButton: {
    flex: 1,
    marginLeft: 5,
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
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  exportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exportDescription: {
    marginBottom: 15,
    color: '#666',
  },
  exportButton: {
    alignSelf: 'flex-start',
  },
});

export default SettingsScreen;