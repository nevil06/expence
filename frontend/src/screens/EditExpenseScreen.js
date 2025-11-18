import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button, HelperText } from 'react-native-paper';
import { getExpense, updateExpense, getCategories } from '../services/api';

const EditExpenseScreen = ({ route, navigation }) => {
  const { expenseId } = route.params;
  const [expense, setExpense] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExpense();
    loadCategories();
  }, []);

  const loadExpense = async () => {
    try {
      const expenseData = await getExpense(expenseId);
      setExpense(expenseData);
      setAmount(expenseData.amount.toString());
      setDescription(expenseData.description);
      setCategoryId(expenseData.categoryId);
      setDate(new Date(expenseData.date).toISOString().split('T')[0]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading expense:', error);
      Alert.alert('Error', 'Failed to load expense');
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesResponse = await getCategories();
      setCategories(categoriesResponse || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
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

  const handleUpdateExpense = async () => {
    if (!validateForm()) return;

    try {
      const expenseData = {
        amount: parseFloat(amount),
        description,
        categoryId,
        date: new Date(date).toISOString(),
      };

      await updateExpense(expenseId, expenseData);
      Alert.alert('Success', 'Expense updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating expense:', error);
      Alert.alert('Error', error.message || 'Failed to update expense');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={[styles.input, errors.amount && styles.errorInput]}
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        {errors.amount && <HelperText type="error">{errors.amount}</HelperText>}
        
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, errors.description && styles.errorInput]}
          placeholder="What was this expense for?"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        {errors.description && <HelperText type="error">{errors.description}</HelperText>}
        
        <Text style={styles.label}>Category</Text>
        <View style={[styles.pickerContainer, errors.category && styles.errorInput]}>
          <Picker
            selectedValue={categoryId}
            onValueChange={setCategoryId}
            style={styles.picker}
          >
            {categories.map((category) => (
              <Picker.Item key={category.id} label={category.name} value={category.id} />
            ))}
          </Picker>
        </View>
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
          onPress={handleUpdateExpense}
        >
          Update Expense
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
  },
  form: {
    padding: 20,
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
  button: {
    marginTop: 10,
    paddingVertical: 5,
  },
});

export default EditExpenseScreen;