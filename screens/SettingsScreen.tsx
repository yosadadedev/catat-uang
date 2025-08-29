import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '../store/useStore';
import { Category } from '../database/database';

const SettingsScreen = () => {
  const { categories, loading } = useFinanceStore();
  const { addCategory, updateCategory, deleteCategory, loadCategories } = useFinanceStore();

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('💰');
  const [categoryColor, setCategoryColor] = useState('#3B82F6');
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const predefinedIcons = [
    '💰', '🍔', '🚗', '🏠', '💊', '🎬', '👕', '📱',
    '⛽', '🛒', '💡', '🎓', '✈️', '🎮', '📚', '🏥',
    '🍕', '☕', '🚌', '🎵', '💻', '🏋️', '🎨', '🔧'
  ];

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
  ];

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Nama kategori tidak boleh kosong');
      return;
    }

    try {
      if (editingCategory && editingCategory.id !== undefined) {
        await updateCategory(editingCategory.id, {
          name: categoryName.trim(),
          icon: categoryIcon,
          color: categoryColor,
          type: categoryType,
        });
        Alert.alert('Sukses', 'Kategori berhasil diperbarui');
      } else {
        await addCategory({
          name: categoryName.trim(),
          icon: categoryIcon,
          color: categoryColor,
          type: categoryType,
        });
        Alert.alert('Sukses', 'Kategori berhasil ditambahkan');
      }
      
      resetForm();
      setShowAddCategory(false);
      setEditingCategory(null);
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan kategori');
    }
  };

  const handleDeleteCategory = (category: Category) => {
    if (category.id === undefined) return;
    
    Alert.alert(
      'Hapus Kategori',
      `Apakah Anda yakin ingin menghapus kategori "${category.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id!);
              Alert.alert('Sukses', 'Kategori berhasil dihapus');
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus kategori');
            }
          },
        },
      ]
    );
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryIcon(category.icon);
    setCategoryColor(category.color);
    setCategoryType(category.type);
    setShowAddCategory(true);
  };

  const resetForm = () => {
    setCategoryName('');
    setCategoryIcon('💰');
    setCategoryColor('#3B82F6');
    setCategoryType('expense');
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
        <Text className="text-xl font-bold text-gray-900">Pengaturan</Text>
        <Text className="text-gray-600 mt-1">Kelola kategori dan preferensi aplikasi</Text>
      </View>

      {/* App Preferences */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
        <Text className="text-lg font-bold text-gray-900 mb-4">Preferensi Aplikasi</Text>
        
        <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <View className="flex-row items-center flex-1">
            <Ionicons name="notifications" size={20} color="#6B7280" />
            <View className="ml-3 flex-1">
              <Text className="text-gray-900 font-medium">Notifikasi</Text>
              <Text className="text-gray-500 text-sm">Terima pengingat dan notifikasi</Text>
            </View>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
            thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <View className="flex-row items-center justify-between py-3">
          <View className="flex-row items-center flex-1">
            <Ionicons name="moon" size={20} color="#6B7280" />
            <View className="ml-3 flex-1">
              <Text className="text-gray-900 font-medium">Mode Gelap</Text>
              <Text className="text-gray-500 text-sm">Tampilan gelap untuk mata</Text>
            </View>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
            thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>

      {/* Category Management */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold text-gray-900">Manajemen Kategori</Text>
          <TouchableOpacity
            onPress={() => {
              resetForm();
              setEditingCategory(null);
              setShowAddCategory(true);
            }}
            className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="add" size={16} color="white" />
            <Text className="text-white font-medium ml-1">Tambah</Text>
          </TouchableOpacity>
        </View>

        {/* Income Categories */}
        <View className="mb-6">
          <Text className="text-md font-semibold text-green-700 mb-3">Kategori Pemasukan</Text>
          {incomeCategories.length > 0 ? (
            incomeCategories.map((category) => (
              <View key={category.id} className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <View className="flex-row items-center flex-1">
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                      backgroundColor: category.color + '20'
                    }}
                  >
                    <Ionicons name={category.icon as any} size={20} color={category.color} />
                  </View>
                  <Text className="text-gray-900 font-medium flex-1">{category.name}</Text>
                </View>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => handleEditCategory(category)}
                    className="p-2 mr-2"
                  >
                    <Ionicons name="pencil" size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteCategory(category)}
                    className="p-2"
                  >
                    <Ionicons name="trash" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text className="text-gray-500 text-center py-4">Belum ada kategori pemasukan</Text>
          )}
        </View>

        {/* Expense Categories */}
        <View>
          <Text className="text-md font-semibold text-red-700 mb-3">Kategori Pengeluaran</Text>
          {expenseCategories.length > 0 ? (
            expenseCategories.map((category) => (
              <View key={category.id} className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <View className="flex-row items-center flex-1">
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                      backgroundColor: category.color + '20'
                    }}
                  >
                    <Ionicons name={category.icon as any} size={20} color={category.color} />
                  </View>
                  <Text className="text-gray-900 font-medium flex-1">{category.name}</Text>
                </View>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => handleEditCategory(category)}
                    className="p-2 mr-2"
                  >
                    <Ionicons name="pencil" size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteCategory(category)}
                    className="p-2"
                  >
                    <Ionicons name="trash" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text className="text-gray-500 text-center py-4">Belum ada kategori pengeluaran</Text>
          )}
        </View>
      </View>

      {/* About Section */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
        <Text className="text-lg font-bold text-gray-900 mb-4">Tentang Aplikasi</Text>
        
        <View className="items-center py-4">
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-3">
            <Ionicons name="wallet" size={32} color="#3B82F6" />
          </View>
          <Text className="text-gray-900 font-bold text-lg">Catatan Keuangan</Text>
          <Text className="text-gray-500 text-sm mt-1">Versi 1.0.0</Text>
          <Text className="text-gray-500 text-sm text-center mt-3">
            Aplikasi sederhana untuk mencatat dan mengelola keuangan pribadi
          </Text>
        </View>
      </View>

      {/* Add/Edit Category Modal */}
      <Modal
        visible={showAddCategory}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowAddCategory(false);
          setEditingCategory(null);
          resetForm();
        }}
      >
        <View className="flex-1 bg-gray-50">
          <View className="bg-white p-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => {
                  setShowAddCategory(false);
                  setEditingCategory(null);
                  resetForm();
                }}
              >
                <Text className="text-blue-600 font-medium">Batal</Text>
              </TouchableOpacity>
              <Text className="text-lg font-bold text-gray-900">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
              </Text>
              <TouchableOpacity onPress={handleSaveCategory}>
                <Text className="text-blue-600 font-medium">Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Category Name */}
            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
              <Text className="text-gray-700 font-medium mb-2">Nama Kategori</Text>
              <TextInput
                value={categoryName}
                onChangeText={setCategoryName}
                placeholder="Masukkan nama kategori"
                className="bg-gray-50 p-3 rounded-lg text-gray-900"
                maxLength={50}
              />
            </View>

            {/* Category Type */}
            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
              <Text className="text-gray-700 font-medium mb-3">Jenis Kategori</Text>
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => setCategoryType('income')}
                  className={`flex-1 py-3 px-4 rounded-lg mr-2 items-center ${
                    categoryType === 'income' ? 'bg-green-600' : 'bg-gray-100'
                  }`}
                >
                  <Text className={`font-medium ${
                    categoryType === 'income' ? 'text-white' : 'text-gray-600'
                  }`}>
                    Pemasukan
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setCategoryType('expense')}
                  className={`flex-1 py-3 px-4 rounded-lg ml-2 items-center ${
                    categoryType === 'expense' ? 'bg-red-600' : 'bg-gray-100'
                  }`}
                >
                  <Text className={`font-medium ${
                    categoryType === 'expense' ? 'text-white' : 'text-gray-600'
                  }`}>
                    Pengeluaran
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Category Icon */}
            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
              <Text className="text-gray-700 font-medium mb-3">Pilih Icon</Text>
              <View className="flex-row flex-wrap">
                {predefinedIcons.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => setCategoryIcon(icon)}
                    className={`w-12 h-12 items-center justify-center rounded-lg m-1 ${
                      categoryIcon === icon ? 'bg-blue-100 border-2 border-blue-600' : 'bg-gray-50'
                    }`}
                  >
                    <Text className="text-xl">{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category Color */}
            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
              <Text className="text-gray-700 font-medium mb-3">Pilih Warna</Text>
              <View className="flex-row flex-wrap">
                {predefinedColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setCategoryColor(color)}
                    className={`w-12 h-12 rounded-lg m-1 ${
                      categoryColor === color ? 'border-4 border-gray-400' : 'border border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </View>
            </View>

            {/* Preview */}
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <Text className="text-gray-700 font-medium mb-3">Preview</Text>
              <View className="flex-row items-center">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: categoryColor + '20' }}
                >
                  <Text className="text-xl">{categoryIcon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">
                    {categoryName || 'Nama Kategori'}
                  </Text>
                  <Text className="text-gray-500 text-sm capitalize">
                    {categoryType === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Bottom Spacing */}
      <View className="h-8" />
    </ScrollView>
  );
};

export default SettingsScreen;