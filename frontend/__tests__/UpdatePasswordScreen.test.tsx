import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import UpdatePasswordScreen from '../src/screens/UpdatePasswordScreen';

// Mock API service
jest.mock('../src/services/api', () => ({
  updatePassword: jest.fn(),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({
    params: {
      token: 'test-token',
    },
  }),
}));

describe('UpdatePasswordScreen', () => {
  it('renders correctly', () => {
    const { getByText, getByLabelText } = render(<UpdatePasswordScreen />);

    expect(getByText('Update Password')).toBeTruthy();
    expect(getByLabelText('New Password')).toBeTruthy();
    expect(getByLabelText('Confirm New Password')).toBeTruthy();
  });

  it('shows an error message if passwords do not match', async () => {
    const { getByText, getByLabelText } = render(<UpdatePasswordScreen />);

    const passwordInput = getByLabelText('New Password');
    const confirmPasswordInput = getByLabelText('Confirm New Password');
    const submitButton = getByText('Update Password');

    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password456');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('Passwords do not match.')).toBeTruthy();
    });
  });
});
