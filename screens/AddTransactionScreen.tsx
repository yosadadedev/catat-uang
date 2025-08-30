import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { CategoryPicker } from '../components/CategoryPicker';
import { DatePicker } from '../components/DatePicker';
import { useFinanceStore } from '../store/useStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Category } from '../database/database';

type AddTransactionScreenRouteProp = RouteProp<RootStackParamList, 'AddTransaction'>;
type AddTransactionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddTransaction'>;

const AddTransactionScreen = () => {
  const navigation = useNavigation<AddTransactionScreenNavigationProp>();
  const route = useRoute<AddTransactionScreenRouteProp>();
  const categories = useFinanceStore((state) => state.categories);
  const transactions = useFinanceStore((state) => state.transactions);
  const { addTransaction, updateTransaction } = useFinanceStore();
  
  const isEditMode = route.params?.isEdit || false;
  const transactionId = route.params?.transactionId;

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(
    route.params?.type || 'expense'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (isEditMode && transactionId) {
      // Load existing transaction data for edit mode
      const transaction = transactions.find(t => t.id === transactionId);
      if (transaction) {
        setAmount(formatCurrency(Math.abs(transaction.amount).toString()));
        setDescription(transaction.description);
        setSelectedDate(new Date(transaction.date));
        setTransactionType(transaction.type);
        
        const category = categories.find(c => c.id === transaction.category_id);
        if (category) {
          setSelectedCategory(category);
        }
      }
    } else if (route.params?.categoryId) {
      const category = categories.find(c => c.id === route.params.categoryId);
      if (category) {
        setSelectedCategory(category);
        setTransactionType(category.type);
      }
    }
  }, [route.params?.categoryId, categories, isEditMode, transactionId, transactions]);

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

    if (!description.trim()) {
      Alert.alert('Error', 'Mohon masukkan deskripsi');
      return;
    }

    setIsLoading(true);

    try {
      const transactionAmount = transactionType === 'expense' 
        ? -Math.abs(parseCurrency(amount))
        : Math.abs(parseCurrency(amount));

      const transactionData = {
        amount: transactionAmount,
        description: description.trim(),
        category_id: selectedCategory.id!,
        date: selectedDate.toISOString(),
        type: transactionType,
      };

      if (isEditMode && transactionId) {
        await updateTransaction(transactionId, transactionData);
      } else {
        await addTransaction(transactionData);
      }

      Alert.alert(
        'Berhasil',
        `Transaksi ${transactionType === 'income' ? 'pemasukan' : 'pengeluaran'} berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', `Gagal ${isEditMode ? 'memperbarui' : 'menyimpan'} transaksi. Silakan coba lagi.`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === transactionType);

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Transaction Type Toggle */}
        <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
          <Text className="text-gray-900 font-semibold text-lg mb-4">Jenis Transaksi</Text>
          <View style={{
            flexDirection: 'row',
            backgroundColor: '#F3F4F6',
            borderRadius: 12,
            padding: 4
          }}>
            <TouchableOpacity
              onPress={() => {
                setTransactionType('expense');
                setSelectedCategory(null);
              }}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: transactionType === 'expense' ? '#EF4444' : 'transparent'
              }}
            >
              <Text style={{
                fontWeight: '600',
                color: transactionType === 'expense' ? 'white' : '#6B7280'
              }}>
                Pengeluaran
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setTransactionType('income');
                setSelectedCategory(null);
              }}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: transactionType === 'income' ? '#10B981' : 'transparent'
              }}
            >
              <Text style={{
                fontWeight: '600',
                color: transactionType === 'income' ? 'white' : '#6B7280'
              }}>
                Pemasukan
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount Input */}
        <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
          <Text className="text-gray-900 font-semibold text-lg mb-4">Jumlah</Text>
          <View className="flex-row items-center">
            <Text className="text-gray-600 text-lg mr-2">Rp</Text>
            <TextInput
              className="flex-1 text-2xl font-bold text-gray-900"
              placeholder="0"
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              maxLength={15}
            />
          </View>
        </View>

        {/* Category Selection */}
        <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
          <Text className="text-gray-900 font-semibold text-lg mb-4">Kategori</Text>
          <TouchableOpacity
            onPress={() => setShowCategoryPicker(true)}
            className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl"
          >
            {selectedCategory ? (
              <View className="flex-row items-center">
                <Ionicons name={selectedCategory.icon as any} size={24} color="#374151" style={{ marginRight: 12 }} />
                <Text className="text-gray-900 font-medium text-lg">
                  {selectedCategory.name}
                </Text>
              </View>
            ) : (
              <Text className="text-gray-500 text-lg">Pilih kategori</Text>
            )}
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Description Input */}
        <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
          <Text className="text-gray-900 font-semibold text-lg mb-4">Deskripsi</Text>
          <TextInput
            className="text-gray-900 text-lg p-4 bg-gray-50 rounded-xl"
            placeholder="Masukkan deskripsi transaksi..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={200}
          />
          <Text className="text-gray-400 text-sm mt-2 text-right">
            {description.length}/200
          </Text>
        </View>

        {/* Date Selection */}
        <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
          <Text className="text-gray-900 font-semibold text-lg mb-4">Tanggal</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl"
          >
            <View className="flex-row items-center">
              <Ionicons name="calendar" size={20} color="#6B7280" className="mr-3" />
              <Text className="text-gray-900 font-medium text-lg ml-3">
                {selectedDate.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <View className="mx-4 mt-6 mb-8">
          <TouchableOpacity
            onPress={handleSaveTransaction}
            disabled={isLoading}
            style={{
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              backgroundColor: isLoading ? '#9CA3AF' : '#2563EB',
              marginTop: 8
            }}
          >
            <Text style={{
              color: 'white',
              fontWeight: '600',
              fontSize: 18
            }}>
              {isLoading ? (isEditMode ? 'Memperbarui...' : 'Menyimpan...') : (isEditMode ? 'Perbarui Transaksi' : 'Simpan Transaksi')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Category Picker Modal */}
      {showCategoryPicker && (
          <Modal
            visible={showCategoryPicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowCategoryPicker(false)}
          >
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'flex-end'
            }}>
              <View style={{
                backgroundColor: 'white',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 24,
                maxHeight: 384
              }}>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-xl font-bold text-gray-900">
                    Pilih Kategori {transactionType === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowCategoryPicker(false)}
                    className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                  >
                    <Ionicons name="close" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {filteredCategories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => {
                        setSelectedCategory(category);
                        setShowCategoryPicker(false);
                      }}
                      className={`flex-row items-center p-4 rounded-xl mb-2 ${
                        selectedCategory?.id === category.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <Ionicons 
                        name={category.icon as any} 
                        size={24} 
                        color={category.color} 
                        style={{ marginRight: 16 }}
                      />
                      <Text className="text-gray-900 font-medium text-lg flex-1">
                        {category.name}
                      </Text>
                      {selectedCategory?.id === category.id && (
                        <Ionicons name="checkmark" size={20} color="#2563EB" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}

      {/* Date Picker Modal */}
      {showDatePicker && (
          <Modal
            visible={showDatePicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View className="flex-1 bg-black/50 justify-end">
              <View className="bg-white rounded-t-3xl p-6">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-xl font-bold text-gray-900">
                    Pilih Tanggal
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                  >
                    <Ionicons name="close" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <DatePicker
                  date={selectedDate}
                  onDateChange={(date) => {
                    setSelectedDate(date);
                    setShowDatePicker(false);
                  }}
                />
              </View>
            </View>
          </Modal>
        )}
    </KeyboardAvoidingView>
  );
};

export default AddTransactionScreen;