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
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '../store/useStore';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { Category } from '../database/database';
import { DrawerParamList } from '../navigation/AppNavigator';

type SettingsScreenNavigationProp = DrawerNavigationProp<DrawerParamList, 'Settings'>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { categories, loading } = useFinanceStore();
  const { addCategory, updateCategory, deleteCategory, loadCategories } = useFinanceStore();
  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const { locale, setLocale, t } = useLocalization();

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('💰');
  const [categoryColor, setCategoryColor] = useState('#3B82F6');
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');
  const [notifications, setNotifications] = useState(true);

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
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#3B82F6',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
              style={{
                marginRight: 12,
                padding: 8,
                borderRadius: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <Ionicons name="menu" size={20} color="white" />
            </TouchableOpacity>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>{t('settingsTitle')}</Text>
          </View>
        </View>
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 16 }}>{t('settingsSubtitle')}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* App Preferences */}
        <View style={{
          backgroundColor: 'white',
          marginHorizontal: 16,
          marginTop: 16,
          borderRadius: 12,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>{t('appPreferences')}</Text>
        
        <View 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons name="notifications" size={20} color="#F59E0B" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: '#111827', fontWeight: '500' }}>{t('notifications')}</Text>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>{t('notificationsDesc')}</Text>
            </View>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
            thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons name="moon" size={20} color="#6366F1" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: '#111827', fontWeight: '500' }}>{t('darkMode')}</Text>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>{t('darkModeDesc')}</Text>
            </View>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
            thumbColor={isDarkMode ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <TouchableOpacity
          onPress={() => setShowLanguageModal(true)}
         style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons name="language" size={20} color="#10B981" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: '#111827', fontWeight: '500' }}>{t('language')}</Text>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>{t('languageDesc')}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#6B7280', marginRight: 8 }}>
              {locale === 'id' ? 'Indonesia' : 'English'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}
          onPress={() => {
              resetForm();
              setEditingCategory(null);
              setShowAddCategory(true);
            }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons name="folder" size={20} color="#8B5CF6" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: '#111827', fontWeight: '500' }}>{t('categoryManagement')}</Text>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>{t('categoryManagementDesc')}</Text>
            </View>
          </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </View>
        </TouchableOpacity>
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
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
          <View style={{ backgroundColor: '#FFFFFF', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
                Tambah Kategori
              </Text>
            </View>
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }}>
             {/* Category Name */}
             <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, borderWidth: 1, borderColor: '#E5E7EB' }}>
               <Text style={{ color: colors.text, fontWeight: '500', marginBottom: 8 }}>{t('categoryName')}</Text>
               <TextInput
                 value={categoryName}
                 onChangeText={setCategoryName}
                 placeholder={t('enterCategoryName')}
                 style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, color: colors.text, borderWidth: 1, borderColor: colors.border }}
                 placeholderTextColor={colors.textSecondary}
                 maxLength={50}
               />
             </View>

             {/* Category Type */}
             <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, borderWidth: 1, borderColor: '#E5E7EB' }}>
               <Text style={{ color: colors.text, fontWeight: '500', marginBottom: 12 }}>{t('categoryType')}</Text>
               <View style={{ flexDirection: 'row' }}>
                 <TouchableOpacity
                   onPress={() => setCategoryType('income')}
                   style={{
                     flex: 1,
                     paddingVertical: 12,
                     paddingHorizontal: 16,
                     borderRadius: 8,
                     marginRight: 8,
                     alignItems: 'center',
                     backgroundColor: categoryType === 'income' ? '#10B981' : colors.background
                   }}
                 >
                   <Text style={{
                     fontWeight: '500',
                     color: categoryType === 'income' ? 'white' : colors.textSecondary
                   }}>
                     {t('income')}
                   </Text>
                 </TouchableOpacity>
                 <TouchableOpacity
                   onPress={() => setCategoryType('expense')}
                   style={{
                     flex: 1,
                     paddingVertical: 12,
                     paddingHorizontal: 16,
                     borderRadius: 8,
                     marginLeft: 8,
                     alignItems: 'center',
                     backgroundColor: categoryType === 'expense' ? '#EF4444' : colors.background
                   }}
                 >
                   <Text style={{
                     fontWeight: '500',
                     color: categoryType === 'expense' ? 'white' : colors.textSecondary
                   }}>
                     {t('expense')}
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
          
          {/* Bottom Buttons */}
          <View style={{ backgroundColor: '#FFFFFF', padding: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowAddCategory(false);
                  setEditingCategory(null);
                  resetForm();
                }}
                style={{
                   flex: 1,
                   paddingVertical: 12,
                   borderRadius: 8,
                   backgroundColor: '#EF4444',
                   alignItems: 'center'
                 }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSaveCategory}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: '#2563EB',
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>{t('save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ backgroundColor: colors.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Text style={{ color: colors.primary, fontWeight: '500' }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
                {t('language')}
              </Text>
              <View style={{ width: 60 }} />
            </View>
          </View>

          <View style={{ flex: 1, padding: 16 }}>
            <TouchableOpacity
              onPress={() => {
                setLocale('id');
                setShowLanguageModal(false);
              }}
              style={{
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
                borderWidth: locale === 'id' ? 2 : 1,
                borderColor: locale === 'id' ? colors.primary : colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, marginRight: 12 }}>🇮🇩</Text>
                <View>
                  <Text style={{ color: colors.text, fontWeight: '500', fontSize: 16 }}>Indonesia</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Bahasa Indonesia</Text>
                </View>
              </View>
              {locale === 'id' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setLocale('en');
                setShowLanguageModal(false);
              }}
              style={{
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 12,
                borderWidth: locale === 'en' ? 2 : 1,
                borderColor: locale === 'en' ? colors.primary : colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, marginRight: 12 }}>🇺🇸</Text>
                <View>
                  <Text style={{ color: colors.text, fontWeight: '500', fontSize: 16 }}>English</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 14 }}>English (US)</Text>
                </View>
              </View>
              {locale === 'en' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

        {/* Bottom Spacing */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;