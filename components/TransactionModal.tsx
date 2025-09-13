import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFinanceStore } from '../store/useStore';
import { Category, Transaction } from '../database/database';
import { iconOptions, iconColors } from '../constants';

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  initialType?: 'income' | 'expense';
  initialCategoryId?: number;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  visible,
  onClose,
  transaction,
  initialType = 'expense',
  initialCategoryId,
}) => {
  const categories = useFinanceStore((state) => state.categories);
  const { addTransaction, updateTransaction, deleteTransaction, addCategory } = useFinanceStore();
  
  const isEditMode = !!transaction;

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(initialType);
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('help-circle');
  const [selectedIconColor, setSelectedIconColor] = useState('#3B82F6');
  const [previousCategories, setPreviousCategories] = useState<{
    income?: Category;
    expense?: Category;
  }>({});

  useEffect(() => {
    if (visible) {
      if (isEditMode && transaction) {
        // Load existing transaction data for edit mode
        setAmount(formatCurrency(Math.abs(transaction.amount).toString()));
        setDescription(transaction.description || '');
        setSelectedDate(new Date(transaction.date));
        setTransactionType(transaction.type);
        
        const category = categories.find(c => c.id === transaction.category_id);
        if (category) {
          setSelectedCategory(category);
          // Initialize previousCategories with current category
          setPreviousCategories({
            [category.type]: category
          });
        }
      } else {
        // Reset for new transaction
        setAmount('');
        setDescription('');
        setSelectedCategory(undefined);
        setSelectedDate(new Date());
        setTransactionType(initialType);
        setPreviousCategories({});
        
        // Set initial category if provided
        if (initialCategoryId) {
          const category = categories.find(c => c.id === initialCategoryId);
          if (category) {
            setSelectedCategory(category);
            setTransactionType(category.type);
            // Initialize previousCategories with initial category
            setPreviousCategories({
              [category.type]: category
            });
          }
        }
      }
    }
  }, [visible, transaction, categories, isEditMode, initialType, initialCategoryId]);

  const formatCurrency = (value: string): string => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(numericValue));
  };

  const parseCurrency = (value: string): number => {
    return parseInt(value.replace(/[^0-9]/g, '')) || 0;
  };

  const handleAmountChange = (value: string) => {
    const formatted = formatCurrency(value);
    setAmount(formatted);
  };

  const handleSaveTransaction = async () => {
    if (!amount || parseCurrency(amount) === 0) {
      Alert.alert('Error', 'Mohon masukkan jumlah yang valid');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Mohon pilih kategori');
      return;
    }

    // Deskripsi sekarang optional, tidak perlu validasi

    setIsLoading(true);

    try {
      const transactionAmount = transactionType === 'expense' 
        ? -Math.abs(parseCurrency(amount))
        : Math.abs(parseCurrency(amount));

      const transactionData = {
        amount: transactionAmount,
        description: description.trim() || '', // Default ke string kosong jika tidak ada deskripsi
        category_id: selectedCategory.id!,
        date: selectedDate.toISOString(),
        type: transactionType,
      };

      if (isEditMode && transaction) {
        await updateTransaction(transaction.id!, transactionData);
      } else {
        await addTransaction(transactionData);
      }

      Alert.alert(
        'Berhasil',
        `Transaksi ${transactionType === 'income' ? 'pemasukan' : 'pengeluaran'} berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}`,
        [
          {
            text: 'OK',
            onPress: () => onClose(),
          },
        ]
      );
    } catch {
      Alert.alert('Error', `Gagal ${isEditMode ? 'memperbarui' : 'menyimpan'} transaksi. Silakan coba lagi.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = () => {
    if (transaction && transaction.id) {
      Alert.alert(
        'Hapus Transaksi',
        'Apakah Anda yakin ingin menghapus transaksi ini?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Hapus',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteTransaction(transaction.id!);
                onClose();
              } catch (error) {
                Alert.alert('Error', 'Gagal menghapus transaksi');
              }
            },
          },
        ]
      );
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Nama kategori tidak boleh kosong');
      return;
    }

    try {
      const newCategory = {
        name: newCategoryName.trim(),
        icon: selectedIcon,
        color: selectedIconColor,
        type: transactionType,
      };

      await addCategory(newCategory);
      
      // Find the newly added category
      const updatedCategories = categories.filter(c => c.type === transactionType);
      const addedCategory = updatedCategories.find(c => c.name === newCategoryName.trim());
      
      if (addedCategory) {
        setSelectedCategory(addedCategory);
      }
      
      setShowAddCategoryModal(false);
      setShowCategoryPicker(false);
      
      // Reset form
      setNewCategoryName('');
      setSelectedIcon('help-circle');
      setSelectedIconColor('#3B82F6');
    } catch (error) {
      Alert.alert('Error', 'Gagal menambah kategori');
    }
  };

  const filteredCategories = categories.filter(c => c.type === transactionType);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalContainer}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
          style={styles.modalContent}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditMode ? 'Edit Transaksi' : 'Tambah Transaksi'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Transaction Type Toggle */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Jenis Transaksi *</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    transactionType === 'expense' && styles.typeButtonActive,
                    { backgroundColor: transactionType === 'expense' ? '#EF4444' : '#F3F4F6' }
                  ]}
                  onPress={() => {
                    // Save current category for income type
                    if (transactionType === 'income' && selectedCategory) {
                      setPreviousCategories(prev => ({
                        ...prev,
                        income: selectedCategory
                      }));
                    }
                    setTransactionType('expense');
                    // Restore previous expense category if exists
                    setSelectedCategory(previousCategories.expense);
                  }}
                >
                  <Ionicons 
                    name="trending-down" 
                    size={20} 
                    color={transactionType === 'expense' ? 'white' : '#6B7280'} 
                  />
                  <Text style={[
                    styles.typeButtonText,
                    { color: transactionType === 'expense' ? 'white' : '#6B7280' }
                  ]}>
                    Pengeluaran
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    transactionType === 'income' && styles.typeButtonActive,
                    { backgroundColor: transactionType === 'income' ? '#10B981' : '#F3F4F6' }
                  ]}
                  onPress={() => {
                    // Save current category for expense type
                    if (transactionType === 'expense' && selectedCategory) {
                      setPreviousCategories(prev => ({
                        ...prev,
                        expense: selectedCategory
                      }));
                    }
                    setTransactionType('income');
                    // Restore previous income category if exists
                    setSelectedCategory(previousCategories.income);
                  }}
                >
                  <Ionicons 
                    name="trending-up" 
                    size={20} 
                    color={transactionType === 'income' ? 'white' : '#6B7280'} 
                  />
                  <Text style={[
                    styles.typeButtonText,
                    { color: transactionType === 'income' ? 'white' : '#6B7280' }
                  ]}>
                    Pemasukan
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Jumlah *</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.currencySymbol}>Rp</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  value={amount}
                  onChangeText={handleAmountChange}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Deskripsi (Opsional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Masukkan deskripsi transaksi..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kategori *</Text>
              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => setShowCategoryPicker(true)}
              >
                <View style={styles.categoryDisplay}>
                  {selectedCategory ? (
                    <>
                      <View
                        style={[
                          styles.categoryIcon,
                          { backgroundColor: selectedCategory.color + '20' }
                        ]}
                      >
                        <Ionicons
                          name={selectedCategory.icon as any}
                          size={20}
                          color={selectedCategory.color}
                        />
                      </View>
                      <Text style={styles.categoryName}>{selectedCategory.name}</Text>
                    </>
                  ) : (
                    <Text style={styles.placeholderText}>Pilih kategori</Text>
                  )}
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Date Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tanggal *</Text>
              <TouchableOpacity
                style={styles.dateSelector}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.dateDisplay}>
                  <Ionicons name="calendar" size={20} color="#6B7280" />
                  <Text style={styles.dateText}>
                    {selectedDate.toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Save Button - Fixed at bottom */}
          <View style={styles.buttonContainer}>
            {isEditMode && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteTransaction}
              >
                <Ionicons name="trash" size={20} color="white" />
                <Text style={styles.deleteButtonText}>Hapus</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.saveButton, isEditMode && styles.saveButtonWithDelete]}
              onPress={handleSaveTransaction}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Menyimpan...' : (isEditMode ? 'Perbarui Transaksi' : 'Simpan Transaksi')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Category Picker Modal */}
      {showCategoryPicker && (
        <Modal
          visible={showCategoryPicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCategoryPicker(false)}
        >
          <View style={styles.categoryModalContainer}>
            <View style={styles.categoryModalContent}>
              <View style={styles.categoryModalHeader}>
                <Text style={styles.categoryModalTitle}>Pilih Kategori</Text>
                <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.categoryList}>
                {filteredCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => {
                      setSelectedCategory(category);
                      setShowCategoryPicker(false);
                      
                      // Save selected category to previousCategories
                      setPreviousCategories(prev => ({
                        ...prev,
                        [transactionType]: category
                      }));
                    }}
                    style={styles.categoryItem}
                  >
                    <View
                      style={[
                        styles.categoryItemIcon,
                        { backgroundColor: category.color + '20' }
                      ]}
                    >
                      <Ionicons
                        name={category.icon as any}
                        size={20}
                        color={category.color}
                      />
                    </View>
                    <Text style={styles.categoryItemText}>{category.name}</Text>
                    {selectedCategory?.id === category.id && (
                      <Ionicons name="checkmark" size={20} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))}
                
              </ScrollView>
                              {/* Add Category Option */}
                <TouchableOpacity
                  style={styles.addCategoryOption}
                  onPress={() => {
                    setShowCategoryPicker(false);
                    setShowAddCategoryModal(true);
                  }}
                >
                  <View style={styles.addCategoryIcon}>
                    <Ionicons name="add" size={24} color="#3B82F6" />
                  </View>
                  <Text style={styles.addCategoryText}>Tambah Kategori Baru</Text>
                </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            if (date) {
              setSelectedDate(date);
              setShowDatePicker(false);
            }
          }}
        />
      )}

      {/* Add Category Modal */}
      <Modal
        visible={showAddCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddCategoryModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setShowAddCategoryModal(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
            style={styles.addCategoryModalContent}
          >
            <View style={styles.addCategoryHeader}>
              <Text style={styles.addCategoryTitle}>Tambah Kategori Baru</Text>
              <TouchableOpacity onPress={() => setShowAddCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.addCategoryForm}>
              <Text style={styles.addCategoryLabel}>Nama Kategori</Text>
              <TextInput
                style={styles.addCategoryInput}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="Masukkan nama kategori"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.addCategoryLabel}>Pilih Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScrollView}>
                {iconOptions.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      selectedIcon === icon && styles.selectedIconOption
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Ionicons name={icon as any} size={24} color={selectedIcon === icon ? 'white' : '#6B7280'} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.addCategoryLabel}>Pilih Warna</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScrollView}>
                {iconColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedIconColor === color && styles.selectedColorOption
                    ]}
                    onPress={() => setSelectedIconColor(color)}
                  >
                    {selectedIconColor === color && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.addCategoryButton}
                onPress={handleAddCategory}
              >
                <Text style={styles.addCategoryButtonText}>Tambah Kategori</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end' as const,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%' as const,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top' as const,
  },
  amountContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 18,
    color: '#6B7280',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
    paddingVertical: 12,
  },
  typeContainer: {
    flexDirection: 'row' as const,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 3,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 10,
    borderRadius: 6,
  },
  typeButtonActive: {
    // Active styles handled by backgroundColor prop
  },
  typeButtonText: {
    fontWeight: '600' as const,
    marginLeft: 8,
  },
  categorySelector: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  categoryDisplay: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#111827',
  },
  placeholderText: {
    flex: 1,
    fontSize: 16,
    color: '#9CA3AF',
  },
  dateSelector: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  dateDisplay: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#111827',
    marginLeft: 12,
  },
  buttonContainer: {
    flexDirection: 'row' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center' as const,
    flex: 1,
  },
  saveButtonWithDelete: {
    flex: 2,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    gap: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  categoryModalContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  categoryModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%' as const,
    maxHeight: '80%' as const,
    minHeight: '50%' as const,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  dateModalContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  categoryModalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryModalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
  },
  categoryList: {
    padding: 16,
  },
  categoryItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  categoryItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#111827',
  },
  dateModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%' as const,
    maxHeight: '70%' as const,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  dateModalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateModalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
  },
  dateModalDoneButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  dateModalDoneText: {
    color: 'white',
    fontWeight: '600' as const,
  },
  datePickerContainer: {
    paddingVertical: 20,
    alignItems: 'center' as const,
  },
  addCategoryOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
  },
  addCategoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  addCategoryText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500' as const,
  },
  addCategoryModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%' as const,
    maxHeight: '80%' as const,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  addCategoryHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  addCategoryTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
  },
  addCategoryForm: {
    padding: 20,
  },
  addCategoryLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  addCategoryInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  iconScrollView: {
    marginBottom: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedIconOption: {
    backgroundColor: '#3B82F6',
    borderColor: '#1D4ED8',
  },
  colorScrollView: {
    marginBottom: 24,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addCategoryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center' as const,
  },
  addCategoryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});

export default TransactionModal;