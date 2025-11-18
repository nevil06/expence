import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Menu, Divider } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { getExpenses, getCategories } from '../services/api';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const ReportsScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reportType, setReportType] = useState('monthly'); // monthly or category
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('');
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    generateReport();
  }, []);

  useEffect(() => {
    generateReport();
  }, [reportType, selectedMonth, selectedCategory]);

  const loadCategories = async () => {
    try {
      const categoriesResponse = await getCategories();
      setCategories(categoriesResponse || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    }
  };

  const generateReport = async () => {
    setIsLoading(true);
    try {
      let startDate, endDate;

      if (reportType === 'monthly') {
        startDate = startOfMonth(selectedMonth).toISOString();
        endDate = endOfMonth(selectedMonth).toISOString();
      } else {
        // For category report, we'll use the current month
        startDate = startOfMonth(new Date()).toISOString();
        endDate = endOfMonth(new Date()).toISOString();
      }

      const expensesResponse = await getExpenses({
        startDate,
        endDate,
        categoryId: reportType === 'category' ? selectedCategory : undefined
      });

      setExpenses(expensesResponse.expenses || []);

      if (reportType === 'monthly') {
        calculateMonthlyReport(expensesResponse.expenses || []);
      } else {
        calculateCategoryReport(expensesResponse.expenses || []);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMonthlyReport = (expenses) => {
    const categoryTotals = {};

    expenses.forEach(expense => {
      const categoryName = getCategoryName(expense.categoryId);
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = 0;
      }
      categoryTotals[categoryName] += expense.amount;
    });

    const reportData = Object.entries(categoryTotals).map(([name, amount]) => ({
      name,
      amount,
      percentage: ((amount / getTotalAmount(expenses)) * 100).toFixed(2)
    }));

    setReportData(reportData);
  };

  const calculateCategoryReport = (expenses) => {
    const monthlyTotals = {};

    expenses.forEach(expense => {
      const month = format(new Date(expense.date), 'MMM yyyy');
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = 0;
      }
      monthlyTotals[month] += expense.amount;
    });

    const reportData = Object.entries(monthlyTotals).map(([month, amount]) => ({
      month,
      amount
    }));

    setReportData(reportData);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getTotalAmount = (expenses) => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const formatCurrency = (amount) => {
    return `\$${amount.toFixed(2)}`;
  };

  const months = [];
  for (let i = 0; i < 12; i++) {
    const month = subMonths(new Date(), i);
    months.push({
      value: month,
      label: format(month, 'MMMM yyyy')
    });
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Reports</Title>
      </View>

      <Card style={styles.filtersCard}>
        <Card.Content>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Report Type:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={reportType}
                onValueChange={setReportType}
                style={styles.picker}
              >
                <Picker.Item label="Monthly Summary" value="monthly" />
                <Picker.Item label="Category Summary" value="category" />
              </Picker>
            </View>
          </View>

          {reportType === 'monthly' ? (
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Month:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedMonth}
                  onValueChange={setSelectedMonth}
                  style={styles.picker}
                >
                  {months.map((month, index) => (
                    <Picker.Item key={index} label={month.label} value={month.value} />
                  ))}
                </Picker>
              </View>
            </View>
          ) : (
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Category:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={setSelectedCategory}
                  style={styles.picker}
                >
                  <Picker.Item label="All Categories" value="" />
                  {categories.map((category) => (
                    <Picker.Item key={category.id} label={category.name} value={category.id} />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          <Button 
            mode="contained" 
            style={styles.generateButton}
            onPress={generateReport}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Report'}
          </Button>
        </Card.Content>
      </Card>

      {reportData.length > 0 ? (
        <View style={styles.reportContainer}>
          <Title style={styles.reportTitle}>
            {reportType === 'monthly' ? 'Monthly Summary' : 'Category Summary'}
          </Title>
          
          {reportType === 'monthly' ? (
            reportData.map((item, index) => (
              <Card key={index} style={styles.reportItem}>
                <Card.Content style={styles.reportContent}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <View style={styles.amountContainer}>
                    <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
                    <Text style={styles.percentage}>{item.percentage}%</Text>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            reportData.map((item, index) => (
              <Card key={index} style={styles.reportItem}>
                <Card.Content style={styles.reportContent}>
                  <Text style={styles.categoryName}>{item.month}</Text>
                  <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
                </Card.Content>
              </Card>
            ))
          )}
          
          <View style={styles.totalContainer}>
            <Title>Total: {formatCurrency(getTotalAmount(expenses))}</Title>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No report data available</Text>
          <Text style={styles.emptySubtext}>Generate a report to see the results</Text>
        </View>
      )}
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
  filtersCard: {
    margin: 20,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  filterLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  picker: {
    height: 50,
  },
  generateButton: {
    marginTop: 10,
  },
  reportContainer: {
    padding: 20,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  reportItem: {
    marginBottom: 10,
  },
  reportContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  percentage: {
    fontSize: 12,
    color: '#888',
  },
  totalContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ReportsScreen;