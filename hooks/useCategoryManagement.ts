import { useState } from 'react';
import { Alert } from 'react-native';
import { iconOptions, iconColors } from '../constants';

export type TransactionType = 'income' | 'expense';

interface UseCategoryManagementProps {
  categories: any[];
  addCategory: (category: any) => void;
  deleteCategory: (id: number) => void;
}

export const useCategoryManagement = ({ categories, addCategory, deleteCategory }: UseCategoryManagementProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('folder-outline');
  const [selectedType, setSelectedType] = useState<TransactionType>('expense');
  const [filterType, setFilterType] = useState<TransactionType>('expense');

  const getIconColor = (index: number) => {
    return iconColors[index % iconColors.length];
  };

  const filteredCategories = categories.filter(category => category.type === filterType);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const randomColor = getIconColor(Math.floor(Math.random() * iconColors.length));
      addCategory({
        name: newCategoryName.trim(),
        icon: selectedIcon,
        color: randomColor,
        type: selectedType
      });
      setNewCategoryName('');
      setSelectedIcon('folder-outline');
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

  const resetForm = () => {
    setNewCategoryName('');
    setSelectedIcon('folder-outline');
    setSelectedType('expense');
  };

  return {
    showAddModal,
    setShowAddModal,
    newCategoryName,
    setNewCategoryName,
    selectedIcon,
    setSelectedIcon,
    selectedType,
    setSelectedType,
    filterType,
    setFilterType,
    filteredCategories,
    iconOptions,
    iconColors,
    getIconColor,
    handleAddCategory,
    handleDeleteCategory,
    resetForm
  };
};