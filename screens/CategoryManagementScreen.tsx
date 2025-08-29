import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '../store/useStore';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from '../navigation/AppNavigator';

type CategoryManagementScreenNavigationProp = DrawerNavigationProp<DrawerParamList, 'Categories'>;
type TransactionType = 'income' | 'expense';

const CategoryManagementScreen = () => {
  const navigation = useNavigation<CategoryManagementScreenNavigationProp>();
  const { colors } = useTheme();
  const { categories, addCategory, deleteCategory } = useFinanceStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('folder-outline');
  const [selectedType, setSelectedType] = useState<TransactionType>('expense');
  const [filterType, setFilterType] = useState<TransactionType>('expense');

  const iconOptions = [
    'folder-outline', 'home-outline', 'car-outline', 'restaurant-outline',
    'medical-outline', 'school-outline', 'shirt-outline', 'game-controller-outline',
    'gift-outline', 'airplane-outline', 'fitness-outline', 'library-outline',
    'wallet-outline', 'card-outline', 'cash-outline', 'trending-up-outline',
    'trending-down-outline', 'business-outline', 'briefcase-outline', 'heart-outline'
  ];

  const iconColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
    '#F1948A', '#85C1E9', '#F4D03F', '#AED6F1', '#A9DFBF', '#F5B7B1'
  ];

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{
              padding: 8,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 6,
              marginRight: 12
            }}
          >
            <Ionicons name="menu" size={20} color="white" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: 'white'
          }}>
            Manajemen Kategori
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 6,
            padding: 8
          }}
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Transaction Type Filter */}
      <View style={{
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
            justifyContent: 'center'
          }}
        >
          <Ionicons 
            name="trending-down" 
            size={16} 
            color={filterType === 'expense' ? 'white' : colors.textSecondary} 
            style={{ marginRight: 6 }}
          />
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: filterType === 'expense' ? 'white' : colors.textSecondary
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
            justifyContent: 'center'
          }}
        >
          <Ionicons 
            name="trending-up" 
            size={16} 
            color={filterType === 'income' ? 'white' : colors.textSecondary} 
            style={{ marginRight: 6 }}
          />
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: filterType === 'income' ? 'white' : colors.textSecondary
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
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{
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
                  name={category.icon as keyof typeof Ionicons.glyphMap || 'folder-outline'} 
                  size={22} 
                  color="white" 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.text,
                  marginBottom: 2
                }}>
                  {category.name}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  textTransform: 'capitalize'
                }}>
                  {category.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              onPress={() => handleDeleteCategory(category.id!, category.name)}
              style={{
                backgroundColor: '#EF4444' + '15',
                borderRadius: 8,
                padding: 8
              }}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
        
        {filteredCategories.length === 0 && (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 40
          }}>
            <Ionicons 
              name={filterType === 'income' ? 'trending-up-outline' : 'trending-down-outline'} 
              size={48} 
              color={colors.textSecondary} 
            />
            <Text style={{
              fontSize: 16,
              color: colors.textSecondary,
              marginTop: 12,
              textAlign: 'center'
            }}>
              Belum ada kategori {filterType === 'income' ? 'pemasukan' : 'pengeluaran'}.\nTambahkan kategori pertama Anda!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Category Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            width: '100%',
            maxWidth: 400
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: colors.text,
              marginBottom: 20,
              textAlign: 'center'
            }}>
              Tambah Kategori Baru
            </Text>
            
            {/* Transaction Type Selection */}
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 8
            }}>
              Jenis Transaksi:
            </Text>
            
            <View style={{
              flexDirection: 'row',
              marginBottom: 20,
              backgroundColor: colors.background,
              borderRadius: 8,
              padding: 4
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
                  justifyContent: 'center'
                }}
              >
                <Ionicons 
                  name="trending-down" 
                  size={14} 
                  color={selectedType === 'expense' ? 'white' : colors.textSecondary} 
                  style={{ marginRight: 4 }}
                />
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: selectedType === 'expense' ? 'white' : colors.textSecondary
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
                  justifyContent: 'center'
                }}
              >
                <Ionicons 
                  name="trending-up" 
                  size={14} 
                  color={selectedType === 'income' ? 'white' : colors.textSecondary} 
                  style={{ marginRight: 4 }}
                />
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: selectedType === 'income' ? 'white' : colors.textSecondary
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
                marginBottom: 20
              }}
              placeholder="Nama kategori"
              placeholderTextColor={colors.textSecondary}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 12
            }}>
              Pilih Ikon:
            </Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 20 }}
            >
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {iconOptions.map((icon, index) => {
                  const iconColor = getIconColor(index);
                  const isSelected = selectedIcon === icon;
                  return (
                    <TouchableOpacity
                      key={icon}
                      onPress={() => setSelectedIcon(icon)}
                      style={{
                        backgroundColor: isSelected ? iconColor : colors.background,
                        borderRadius: 12,
                        padding: 12,
                        borderWidth: 2,
                        borderColor: isSelected ? iconColor : colors.border,
                        shadowColor: isSelected ? iconColor : 'transparent',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: isSelected ? 3 : 0,
                      }}
                    >
                      <Ionicons 
                        name={icon as keyof typeof Ionicons.glyphMap} 
                        size={22} 
                        color={isSelected ? 'white' : colors.text} 
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: colors.border,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: 'center'
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.textSecondary
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
                  alignItems: 'center'
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: 'white'
                }}>
                  Tambah
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