import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
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

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesResponse = await getCategories();
      setCategories(categoriesResponse || []);
      if (categoriesResponse && categoriesResponse.length > 0) {
        setCategoryId(categoriesResponse[0].id);
      }
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
      Alert.alert('Success', 'Expense added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', error.message || 'Failed to add expense');
    }
  };

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
          onPress={handleAddExpense}
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

export default AddExpenseScreen;