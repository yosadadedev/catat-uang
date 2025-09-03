import { useState } from 'react';
import { Alert } from 'react-native';
import { iconOptions, iconColors } from '../constants';

export type TransactionType = 'income' | 'expense';

interface UseCategoryManagementProps {
  categories: any[];
  addCategory: (category: any) => void;
  deleteCategory: (id: number) => void;
  updateCategory?: (id: number, category: any) => void;
}

export const useCategoryManagement = ({ categories, addCategory, deleteCategory, updateCategory }: UseCategoryManagementProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('folder-outline');
  const [selectedIconColor, setSelectedIconColor] = useState<string>('#3B82F6');
  const [selectedType, setSelectedType] = useState<TransactionType>('expense');
  const [filterType, setFilterType] = useState<TransactionType>('expense');

  const getIconColor = (index: number) => {
    return iconColors[index % iconColors.length];
  };

  const filteredCategories = categories.filter(category => category.type === filterType);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory({
        name: newCategoryName.trim(),
        icon: selectedIcon,
        color: selectedIconColor,
        type: selectedType
      });
      setNewCategoryName('');
      setSelectedIcon('folder-outline');
      setSelectedIconColor('#3B82F6');
      setSelectedType('expense');
      setShowAddModal(false);
    } else {
      Alert.alert('Error', 'Nama kategori tidak boleh kosong');
    }
  };

  const handleDeleteCategory = (categoryId: number, categoryName: string) => {
    Alert.alert(
      'Hapus Kategori',
      `Apakah Anda yakin ingin menghapus kategori "${categoryName}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => deleteCategory(categoryId),
        },
      ]
    );
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setSelectedIcon(category.icon);
    setSelectedIconColor(category.color || '#3B82F6');
    setSelectedType(category.type);
    setShowEditModal(true);
  };

  const handleUpdateCategory = () => {
    if (newCategoryName.trim() && editingCategory && updateCategory) {
      updateCategory(editingCategory.id, {
        ...editingCategory,
        name: newCategoryName.trim(),
        icon: selectedIcon,
        color: selectedIconColor,
        type: selectedType
      });
      resetForm();
      setShowEditModal(false);
      setEditingCategory(null);
    } else {
      Alert.alert('Error', 'Nama kategori tidak boleh kosong');
    }
  };

  const resetForm = () => {
    setNewCategoryName('');
    setSelectedIcon('folder-outline');
    setSelectedIconColor('#3B82F6');
    setSelectedType('expense');
  };

  return {
    showAddModal,
    setShowAddModal,
    showEditModal,
    setShowEditModal,
    editingCategory,
    setEditingCategory,
    newCategoryName,
    setNewCategoryName,
    selectedIcon,
    setSelectedIcon,
    selectedIconColor,
    setSelectedIconColor,
    selectedType,
    setSelectedType,
    filterType,
    setFilterType,
    filteredCategories,
    iconOptions,
    iconColors,
    getIconColor,
    handleAddCategory,
    handleEditCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    resetForm
  };
};