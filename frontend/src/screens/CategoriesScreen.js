import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, TextInput, Dialog, Portal } from 'react-native-paper';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../services/api';

const CategoriesScreen = () => {
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const categoriesResponse = await getCategories();
      setCategories(categoriesResponse || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const handleAddCategory = () => {
    setEditMode(false);
    setCurrentCategory(null);
    setName('');
    setColor('');
    setIsDialogVisible(true);
  };

  const handleEditCategory = (category) => {
    setEditMode(true);
    setCurrentCategory(category);
    setName(category.name);
    setColor(category.color || '');
    setIsDialogVisible(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editMode && currentCategory) {
        await updateCategory(currentCategory.id, { name, color });
      } else {
        await addCategory({ name, color });
      }
      
      setIsDialogVisible(false);
      await loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('Error', error.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(categoryId);
              await loadCategories();
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', error.message || 'Failed to delete category');
            }
          }
        }
      ]
    );
  };

  const renderCategory = ({ item }) => (
    <Card style={styles.categoryCard}>
      <Card.Content style={styles.categoryContent}>
        <View style={styles.categoryInfo}>
          <Title style={styles.categoryName}>{item.name}</Title>
        </View>
        <View style={styles.categoryActions}>
          <TouchableOpacity onPress={() => handleEditCategory(item)}>
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteCategory(item.id)}>
            <Text style={styles.deleteButton}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Categories</Title>
        <Button mode="contained" onPress={handleAddCategory}>
          Add Category
        </Button>
      </View>

      {categories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No categories found</Text>
          <Text style={styles.emptySubtext}>Add your first category to get started</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
          <Dialog.Title>{editMode ? 'Edit Category' : 'Add Category'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Category Name"
              value={name}
              onChangeText={setName}
              style={styles.dialogInput}
            />
            <TextInput
              label="Color (e.g., #FF6B6B)"
              value={color}
              onChangeText={setColor}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleSaveCategory}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 20,
  },
  categoryCard: {
    marginBottom: 10,
  },
  categoryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryActions: {
    flexDirection: 'row',
  },
  editButton: {
    color: '#007AFF',
    marginRight: 15,
    fontWeight: '600',
  },
  deleteButton: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
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
  dialogInput: {
    marginTop: 10,
  },
});

export default CategoriesScreen;