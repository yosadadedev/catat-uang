import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../database/database';

interface CategoryPickerProps {
  categories: Category[];
  selectedCategory?: Category;
  onSelectCategory: (category: Category) => void;
  type: 'income' | 'expense';
  placeholder?: string;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  type,
  placeholder = 'Pilih kategori',
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const filteredCategories = categories.filter((cat) => cat.type === type);

  const handleSelectCategory = (category: Category) => {
    onSelectCategory(category);
    setIsModalVisible(false);
  };

  return (
    <>
      {/* Category Selector Button */}
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4"
        activeOpacity={0.7}>
        <View className="flex-1 flex-row items-center">
          {selectedCategory ? (
            <>
              <View
                className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: selectedCategory.color + '20' }}>
                <Ionicons
                  name={selectedCategory.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={selectedCategory.color}
                />
              </View>
              <Text className="text-base font-medium text-gray-900">{selectedCategory.name}</Text>
            </>
          ) : (
            <>
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                <Ionicons name="apps" size={20} color="#9CA3AF" />
              </View>
              <Text className="text-base text-gray-500">{placeholder}</Text>
            </>
          )}
        </View>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Category Selection Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}>
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200 p-4">
            <Text className="text-xl font-bold text-gray-900">
              Pilih Kategori {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </Text>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              className="h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Categories Grid */}
          <ScrollView className="flex-1 p-4">
            <View className="flex-row flex-wrap justify-between">
              {filteredCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => handleSelectCategory(category)}
                  className={`mb-4 w-[48%] rounded-xl border-2 p-4 ${
                    selectedCategory?.id === category.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  activeOpacity={0.7}>
                  <View className="items-center">
                    <View
                      className="mb-3 h-16 w-16 items-center justify-center rounded-full"
                      style={{ backgroundColor: category.color + '20' }}>
                      <Ionicons
                        name={category.icon as keyof typeof Ionicons.glyphMap}
                        size={28}
                        color={category.color}
                      />
                    </View>
                    <Text
                      className={`text-center font-medium ${
                        selectedCategory?.id === category.id ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                      {category.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Add New Category Button */}
            <TouchableOpacity
              className="mt-4 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-4"
              activeOpacity={0.7}>
              <View className="items-center">
                <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Ionicons name="add" size={28} color="#6B7280" />
                </View>
                <Text className="font-medium text-gray-600">Tambah Kategori Baru</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Bottom Safe Area */}
          <View className="h-8" />
        </View>
      </Modal>
    </>
  );
};

// Quick Category Grid Component (for home screen)
interface QuickCategoryGridProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
  type: 'income' | 'expense';
  maxItems?: number;
}

export const QuickCategoryGrid: React.FC<QuickCategoryGridProps> = ({
  categories,
  onSelectCategory,
  type,
  maxItems = 8,
}) => {
  const filteredCategories = categories.filter((cat) => cat.type === type).slice(0, maxItems);

  return (
    <View className="flex-row flex-wrap justify-between px-4">
      {filteredCategories.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => onSelectCategory(category)}
          className="mb-4 w-[22%] items-center"
          activeOpacity={0.7}>
          <View
            className="mb-2 h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: category.color + '20' }}>
            <Ionicons
              name={category.icon as keyof typeof Ionicons.glyphMap}
              size={24}
              color={category.color}
            />
          </View>
          <Text className="text-center text-xs font-medium text-gray-700" numberOfLines={1}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
