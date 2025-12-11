import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, FlatList } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { getExpenses, getCategories } from '../services/api';
import { format } from 'date-fns';

const DashboardScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch expenses (last 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);

      const expensesResponse = await getExpenses({
        startDate: thirtyDaysAgo.toISOString(),
        endDate: now.toISOString(),
        limit: 10
      });

      // Handle both formats: { expenses: [...] } or just [...]
      const expensesData = expensesResponse.expenses || expensesResponse || [];
      setExpenses(expensesData);

      // Calculate total spent with safety check
      const total = expensesData.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      setTotalSpent(total);

      // Fetch categories
      const categoriesResponse = await getCategories();
      // Handle both formats: { categories: [...] } or just [...]
      const categoriesData = categoriesResponse.categories || categoriesResponse || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty arrays on error to prevent crashes
      setExpenses([]);
      setCategories([]);
      setTotalSpent(0);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const formatCurrency = (amount) => {
    return `\$${amount.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Title style={styles.title}>Dashboard</Title>
        <Card style={styles.totalCard}>
          <Card.Content>
            <Title style={styles.totalAmount}>{formatCurrency(totalSpent)}</Title>
            <Paragraph style={styles.totalLabel}>Total Spent (Last 30 Days)</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Recent Expenses</Title>
        {expenses.length === 0 ? (
          <Text style={styles.noDataText}>No expenses found</Text>
        ) : (
          <FlatList
            data={expenses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={styles.expenseItem}>
                <Card.Content>
                  <View style={styles.expenseContent}>
                    <View>
                      <Title style={styles.expenseAmount}>{formatCurrency(item.amount)}</Title>
                      <Paragraph style={styles.expenseDescription}>{item.description}</Paragraph>
                      <Paragraph style={styles.expenseCategory}>{getCategoryName(item.categoryId)}</Paragraph>
                    </View>
                    <Text style={styles.expenseDate}>{format(new Date(item.date), 'MMM dd')}</Text>
                  </View>
                </Card.Content>
              </Card>
            )}
            scrollEnabled={false}
          />
        )}
      </View>

      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Categories</Title>
        {categories.length === 0 ? (
          <Text style={styles.noDataText}>No categories found</Text>
        ) : (
          <FlatList
            horizontal
            data={categories.slice(0, 5)} // Show only first 5 categories
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.categoryItem}>
                <Text style={styles.categoryName}>{item.name}</Text>
              </View>
            )}
            showsHorizontalScrollIndicator={false}
          />
        )}
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  totalCard: {
    backgroundColor: '#007AFF',
    padding: 15,
  },
  totalAmount: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  totalLabel: {
    color: '#fff',
    fontSize: 14,
  },
  section: {
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  expenseItem: {
    marginBottom: 10,
  },
  expenseContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff3b30',
  },
  expenseDescription: {
    fontSize: 14,
    color: '#666',
  },
  expenseCategory: {
    fontSize: 12,
    color: '#888',
  },
  expenseDate: {
    fontSize: 14,
    color: '#888',
  },
  categoryItem: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryName: {
    color: '#007AFF',
    fontWeight: '600',
  },
  noDataText: {
    textAlign: 'center',
    color: '#888',
    paddingVertical: 20,
  },
});

export default DashboardScreen;