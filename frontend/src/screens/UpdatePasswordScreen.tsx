import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { updatePassword } from '../services/api';
import { useRoute } from '@react-navigation/native';

const UpdatePasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const route = useRoute();
  const token = route.params?.token;

  const handleUpdatePassword = async () => {
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    if (!password) {
      setMessage('Please enter a new password.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await updatePassword(password, token);
      setMessage(response.message || 'Password updated successfully!');
    } catch (error) {
      setMessage(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Update Password</Title>

      <TextInput
        label="New Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        disabled={loading}
      />

      <TextInput
        label="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
        secureTextEntry
        disabled={loading}
      />

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Button
        mode="contained"
        onPress={handleUpdatePassword}
        style={styles.button}
        disabled={loading}
        loading={loading}
      >
        Update Password
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
});

export default UpdatePasswordScreen;
