import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '../store/useStore';
import { useTheme } from '../contexts/ThemeContext';
import { ScreenHeader } from '../components/common';
import { useCategoryManagement } from '../hooks';
import { iconOptions, iconColors } from '../constants';
import { DrawerParamList } from '../navigation/AppNavigator';

type CategoryManagementScreenNavigationProp = DrawerNavigationProp<DrawerParamList, 'Categories'>;

const CategoryManagementScreen = () => {
  const navigation = useNavigation<CategoryManagementScreenNavigationProp>();
  const { colors } = useTheme();
  const { categories, addCategory, deleteCategory, updateCategory } = useFinanceStore();

  // Use custom hook for category management logic
  const {
    showAddModal,
    setShowAddModal,
    showEditModal,
    setShowEditModal,
    editingCategory,
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
    handleAddCategory,
    handleEditCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  } = useCategoryManagement({ categories, addCategory, deleteCategory, updateCategory });

  // Logic handled by custom hook

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title="Kelola Kategori"
        onMenuPress={() => navigation.openDrawer()}
        rightButton={{
          icon: 'add',
          onPress: () => setShowAddModal(true),
        }}
      />

      {/* Transaction Type Filter */}
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 16,
          marginTop: 16,
          marginBottom: 8,
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
        <TouchableOpacity
          onPress={() => setFilterType('expense')}
          style={{
            flex: 1,
            backgroundColor: filterType === 'expense' ? '#EF4444' : 'transparent',
            borderRadius: 8,
            paddingVertical: 12,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons
            name="trending-down"
            size={16}
            color={filterType === 'expense' ? 'white' : colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: filterType === 'expense' ? 'white' : colors.textSecondary,
            }}>
            Pengeluaran
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilterType('income')}
          style={{
            flex: 1,
            backgroundColor: filterType === 'income' ? '#10B981' : 'transparent',
            borderRadius: 8,
            paddingVertical: 12,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons
            name="trending-up"
            size={16}
            color={filterType === 'income' ? 'white' : colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: filterType === 'income' ? 'white' : colors.textSecondary,
            }}>
            Pemasukan
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {filteredCategories.map((category) => (
          <View
            key={category.id}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
              borderLeftWidth: 4,
              borderLeftColor: category.color || colors.primary,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  backgroundColor: category.color || colors.primary,
                  borderRadius: 12,
                  padding: 12,
                  marginRight: 16,
                  shadowColor: category.color || colors.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}>
                <Ionicons
                  name={(category.icon as keyof typeof Ionicons.glyphMap) || 'folder-outline'}
                  size={22}
                  color="white"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: colors.text,
                    marginBottom: 2,
                  }}>
                  {category.name}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    textTransform: 'capitalize',
                  }}>
                  {category.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => handleEditCategory(category)}
                style={{
                  backgroundColor: colors.primary + '15',
                  borderRadius: 8,
                  padding: 8,
                }}>
                <Ionicons name="pencil-outline" size={18} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDeleteCategory(category.id!, category.name)}
                style={{
                  backgroundColor: '#EF4444' + '15',
                  borderRadius: 8,
                  padding: 8,
                }}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredCategories.length === 0 && (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 40,
            }}>
            <Ionicons
              name={filterType === 'income' ? 'trending-up-outline' : 'trending-down-outline'}
              size={48}
              color={colors.textSecondary}
            />
            <Text
              style={{
                fontSize: 16,
                color: colors.textSecondary,
                marginTop: 12,
                textAlign: 'center',
              }}>
              Belum ada kategori {filterType === 'income' ? 'pemasukan' : 'pengeluaran'}.\nTambahkan
              kategori pertama Anda!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Category Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
          activeOpacity={1}
          onPress={() => setShowAddModal(false)}>
          <View
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
                  backgroundColor:
                    selectedIconColor ||
                    iconColors[iconOptions.indexOf(selectedIcon) % iconColors.length] ||
                    colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16,
                  shadowColor:
                    selectedIconColor ||
                    iconColors[iconOptions.indexOf(selectedIcon) % iconColors.length] ||
                    colors.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}>
                <Ionicons
                  name={(selectedIcon as keyof typeof Ionicons.glyphMap) || 'folder-outline'}
                  size={28}
                  color="white"
                />
              </View>

              {/* Icon Options */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {iconOptions.map((icon, index) => {
                    const iconColor = iconColors[index % iconColors.length];
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
                  backgroundColor: selectedIconColor || iconColors[0],
                  marginRight: 16,
                  borderWidth: 3,
                  borderColor: 'white',
                  shadowColor: selectedIconColor || iconColors[0],
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
                    backgroundColor:
                      selectedIconColor ||
                      iconColors[iconOptions.indexOf(selectedIcon) % iconColors.length] ||
                      colors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor:
                      selectedIconColor ||
                      iconColors[iconOptions.indexOf(selectedIcon) % iconColors.length] ||
                      colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5,
                  }}>
                  <Ionicons
                    name={(selectedIcon as keyof typeof Ionicons.glyphMap) || 'folder-outline'}
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
                onPress={() => setShowAddModal(false)}
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
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 24,
              paddingHorizontal: 28,
              width: '100%',
              maxWidth: 650,
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: colors.text,
                marginBottom: 20,
                textAlign: 'center',
              }}>
              Edit Kategori
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
                  backgroundColor:
                    selectedIconColor ||
                    iconColors[iconOptions.indexOf(selectedIcon) % iconColors.length] ||
                    colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16,
                  shadowColor:
                    selectedIconColor ||
                    iconColors[iconOptions.indexOf(selectedIcon) % iconColors.length] ||
                    colors.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}>
                <Ionicons
                  name={(selectedIcon as keyof typeof Ionicons.glyphMap) || 'folder-outline'}
                  size={28}
                  color="white"
                />
              </View>

              {/* Icon Options */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {iconOptions.map((icon, index) => {
                    const iconColor = iconColors[index % iconColors.length];
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
                  backgroundColor: selectedIconColor || iconColors[0],
                  marginRight: 16,
                  borderWidth: 3,
                  borderColor: 'white',
                  shadowColor: selectedIconColor || iconColors[0],
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
                    backgroundColor:
                      selectedIconColor ||
                      iconColors[iconOptions.indexOf(selectedIcon) % iconColors.length] ||
                      colors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor:
                      selectedIconColor ||
                      iconColors[iconOptions.indexOf(selectedIcon) % iconColors.length] ||
                      colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5,
                  }}>
                  <Ionicons
                    name={(selectedIcon as keyof typeof Ionicons.glyphMap) || 'folder-outline'}
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
                onPress={() => setShowEditModal(false)}
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
                onPress={handleUpdateCategory}
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
                  Simpan
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CategoryManagementScreen;
