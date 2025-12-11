import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button, HelperText } from 'react-native-paper';
import { addExpense, getCategories } from '../services/api';

const AddExpenseScreen = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const categoriesResponse = await getCategories();
      // Handle both formats: { categories: [...] } or just [...]
      const categoriesData = categoriesResponse.categories || categoriesResponse || [];
      setCategories(categoriesData);
      if (categoriesData && categoriesData.length > 0) {
        setCategoryId(categoriesData[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!amount) newErrors.amount = 'Amount is required';
    else if (isNaN(amount) || parseFloat(amount) <= 0) newErrors.amount = 'Amount must be a positive number';

    if (!description) newErrors.description = 'Description is required';
    if (!categoryId) newErrors.category = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddExpense = async () => {
    if (!validateForm()) return;

    try {
      const expenseData = {
        amount: parseFloat(amount),
        description,
        categoryId,
        date: new Date(date).toISOString(),
      };

      await addExpense(expenseData);
      setSuccess('Expense added successfully!');
      setError('');

      // Clear form
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      if (categories.length > 0) {
        setCategoryId(categories[0].id);
      }

      // Navigate back after a short delay
      setTimeout(() => {
        if (navigation && navigation.navigate) {
          navigation.navigate('Dashboard');
        }
      }, 1500);
    } catch (error) {
      console.error('Error adding expense:', error);
      setError(error.message || 'Failed to add expense');
      setSuccess('');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Add Expense</Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {success ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={[styles.input, errors.amount && styles.errorInput]}
          placeholder="0.00"
          value={amount}
          onChangeText={(text) => {
            setAmount(text);
            setErrors({ ...errors, amount: null });
          }}
          keyboardType="numeric"
        />
        {errors.amount && <HelperText type="error">{errors.amount}</HelperText>}

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, errors.description && styles.errorInput]}
          placeholder="What was this expense for?"
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            setErrors({ ...errors, description: null });
          }}
          multiline
        />
        {errors.description && <HelperText type="error">{errors.description}</HelperText>}

        <Text style={styles.label}>Category</Text>
        {categories.length === 0 ? (
          <Text style={styles.noCategoriesText}>No categories available</Text>
        ) : (
          <View style={[styles.pickerContainer, errors.category && styles.errorInput]}>
            <Picker
              selectedValue={categoryId}
              onValueChange={(value) => {
                setCategoryId(value);
                setErrors({ ...errors, category: null });
              }}
              style={styles.picker}
            >
              {categories.map((category) => (
                <Picker.Item key={category.id} label={category.name} value={category.id} />
              ))}
            </Picker>
          </View>
        )}
        {errors.category && <HelperText type="error">{errors.category}</HelperText>}

        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
        />

        <Button
          mode="contained"
          style={styles.button}
          onPress={handleAddExpense}
          disabled={categories.length === 0}
        >
          Add Expense
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    padding: 20,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorText: {
    color: '#c33',
    fontSize: 14,
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: '#efe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#cfc',
  },
  successText: {
    color: '#3c3',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    outlineStyle: 'none',
  },
  errorInput: {
    borderColor: '#ff3b30',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  picker: {
    height: 50,
  },
  noCategoriesText: {
    textAlign: 'center',
    color: '#888',
    paddingVertical: 20,
    fontSize: 14,
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
  },
});

export default AddExpenseScreen;