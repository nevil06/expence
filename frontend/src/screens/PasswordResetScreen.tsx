import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { resetPassword } from '../services/api';

const PasswordResetScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePasswordReset = async () => {
    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await resetPassword(email);
      setMessage(response.message || 'Password reset link sent successfully!');
    } catch (error) {
      setMessage(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Reset Password</Title>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        disabled={loading}
      />

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Button
        mode="contained"
        onPress={handlePasswordReset}
        style={styles.button}
        disabled={loading}
        loading={loading}
      >
        Send Reset Link
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

export default PasswordResetScreen;
