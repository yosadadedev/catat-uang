import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { iconOptions, iconColors } from '../constants/icons';
import { useTheme } from '../contexts/ThemeContext';
// TransactionType is a string literal type
type TransactionType = 'income' | 'expense';

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onAddCategory: (categoryData: {
    name: string;
    icon: string;
    color: string;
    type: TransactionType;
  }) => Promise<void>;
  transactionType: TransactionType;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  visible,
  onClose,
  onAddCategory,
  transactionType,
}) => {
  const { colors } = useTheme();
  const [selectedType, setSelectedType] = useState<TransactionType>(transactionType);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('help-circle');
  const [selectedIconColor, setSelectedIconColor] = useState('#3B82F6');

  // Update selectedType when transactionType prop changes
  React.useEffect(() => {
    setSelectedType(transactionType);
  }, [transactionType]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Nama kategori tidak boleh kosong');
      return;
    }

    try {
      await onAddCategory({
        name: newCategoryName.trim(),
        icon: selectedIcon,
        color: selectedIconColor,
        type: selectedType,
      });

      // Reset form
      setNewCategoryName('');
      setSelectedIcon('help-circle');
      setSelectedIconColor('#3B82F6');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Gagal menambah kategori');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
        activeOpacity={1}
        onPress={onClose}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 24,
            paddingHorizontal: 28,
            width: '100%',
            maxWidth: 'auto',
          }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: colors.text,
              marginBottom: 20,
              textAlign: 'center',
            }}>
            Tambah Kategori Baru
          </Text>

          {/* Transaction Type Selection */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 8,
            }}>
            Jenis Transaksi:
          </Text>

          <View
            style={{
              flexDirection: 'row',
              marginBottom: 20,
              backgroundColor: colors.background,
              borderRadius: 8,
              padding: 4,
            }}>
            <TouchableOpacity
              onPress={() => setSelectedType('expense')}
              style={{
                flex: 1,
                backgroundColor: selectedType === 'expense' ? '#EF4444' : 'transparent',
                borderRadius: 6,
                paddingVertical: 10,
                paddingHorizontal: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons
                name="trending-down"
                size={14}
                color={selectedType === 'expense' ? 'white' : colors.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: selectedType === 'expense' ? 'white' : colors.textSecondary,
                }}>
                Pengeluaran
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedType('income')}
              style={{
                flex: 1,
                backgroundColor: selectedType === 'income' ? '#10B981' : 'transparent',
                borderRadius: 6,
                paddingVertical: 10,
                paddingHorizontal: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons
                name="trending-up"
                size={14}
                color={selectedType === 'income' ? 'white' : colors.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: selectedType === 'income' ? 'white' : colors.textSecondary,
                }}>
                Pemasukan
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              color: colors.text,
              backgroundColor: colors.background,
              marginBottom: 20,
            }}
            placeholder="Nama kategori"
            placeholderTextColor={colors.textSecondary}
            value={newCategoryName}
            onChangeText={setNewCategoryName}
          />

          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 12,
            }}>
            Pilih Ikon:
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            {/* Selected Icon Display */}
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: selectedIconColor,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16,
                shadowColor: selectedIconColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}>
              <Ionicons
                name={selectedIcon as keyof typeof Ionicons.glyphMap}
                size={28}
                color="white"
              />
            </View>

            {/* Icon Options */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {iconOptions.map((icon, index) => {
                  const isSelected = selectedIcon === icon;
                  return (
                    <TouchableOpacity
                      key={icon}
                      onPress={() => setSelectedIcon(icon)}
                      style={{
                        backgroundColor: colors.background,
                        borderRadius: 12,
                        padding: 12,
                        borderWidth: 2,
                        borderColor: isSelected ? colors.primary : colors.border,
                      }}>
                      <Ionicons
                        name={icon as keyof typeof Ionicons.glyphMap}
                        size={22}
                        color={colors.text}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 12,
            }}>
            Pilih Warna Latar Belakang:
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            {/* Selected Color Display */}
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: selectedIconColor,
                marginRight: 16,
                borderWidth: 3,
                borderColor: 'white',
                shadowColor: selectedIconColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}
            />

            {/* Color Options */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {iconColors.map((color, index) => {
                  const isSelected = selectedIconColor === color;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedIconColor(color)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: color,
                        borderWidth: 3,
                        borderColor: isSelected ? 'white' : 'transparent',
                        shadowColor: color,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isSelected ? 0.5 : 0.2,
                        shadowRadius: 4,
                        elevation: isSelected ? 3 : 1,
                      }}
                    />
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Category Preview */}
          <View
            style={{
              alignItems: 'center',
              marginBottom: 20,
              padding: 16,
              backgroundColor: colors.background,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: colors.textSecondary,
                marginBottom: 12,
              }}>
              Preview Kategori:
            </Text>

            <View
              style={{
                alignItems: 'center',
                gap: 8,
              }}>
              {/* Category Icon with Background */}
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: selectedIconColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: selectedIconColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}>
                <Ionicons
                  name={selectedIcon as keyof typeof Ionicons.glyphMap}
                  size={36}
                  color="white"
                />
              </View>

              {/* Category Name */}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text,
                  textAlign: 'center',
                }}>
                {newCategoryName || 'Nama Kategori'}
              </Text>

              {/* Category Type Badge */}
              <View
                style={{
                  backgroundColor: selectedType === 'expense' ? '#EF4444' : '#10B981',
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: 'white',
                  }}>
                  {selectedType === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                backgroundColor: colors.border,
                borderRadius: 8,
                padding: 12,
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.textSecondary,
                }}>
                Batal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAddCategory}
              style={{
                flex: 1,
                backgroundColor: colors.primary,
                borderRadius: 8,
                padding: 12,
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: 'white',
                }}>
                Tambah
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default AddCategoryModal;
