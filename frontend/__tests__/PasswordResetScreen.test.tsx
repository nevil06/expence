import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PasswordResetScreen from '../src/screens/PasswordResetScreen';
import { resetPassword } from '../src/services/api';

jest.useRealTimers();

// Mock API service
jest.mock('../src/services/api', () => ({
  resetPassword: jest.fn(),
}));

describe('PasswordResetScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByLabelText } = render(<PasswordResetScreen />);

    expect(getByText('Reset Password')).toBeTruthy();
    expect(getByLabelText('Email')).toBeTruthy();
    expect(getByText('Send Reset Link')).toBeTruthy();
  });

  it('shows an error message if email is not provided', async () => {
    const { getByText } = render(<PasswordResetScreen />);

    fireEvent.press(getByText('Send Reset Link'));

    await waitFor(() => {
      expect(getByText('Please enter your email address.')).toBeTruthy();
    });
  });

  it('calls the resetPassword function when the form is submitted', async () => {
    const { getByText, getByLabelText } = render(<PasswordResetScreen />);

    const emailInput = getByLabelText('Email');
    const submitButton = getByText('Send Reset Link');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith('test@example.com');
    });
  });
});
