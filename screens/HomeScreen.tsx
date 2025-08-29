import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BalanceCard } from '../components/BalanceCard';
import { TransactionList } from '../components/TransactionCard';
import { QuickCategoryGrid } from '../components/CategoryPicker';
import {
  useFinanceStore,
} from '../store/useStore';
import { RootStackParamList, TabParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const db = useFinanceStore((state) => state.db);
  const loading = useFinanceStore((state) => state.loading);
  const balance = useFinanceStore((state) => state.balance);
  const categories = useFinanceStore((state) => state.categories);
  const getRecentTransactions = useFinanceStore((state) => state.getRecentTransactions);
  const loadTransactions = useFinanceStore((state) => state.loadTransactions);
  const loadCategories = useFinanceStore((state) => state.loadCategories);
  
  // Early return if database not ready
  if (!db) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-600 text-lg">Memuat aplikasi...</Text>
      </View>
    );
  }

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleRefresh = async () => {
    await Promise.all([loadTransactions(), loadCategories()]);
  };

  const handleAddTransaction = (type: 'income' | 'expense', categoryId?: number) => {
    navigation.navigate('AddTransaction', { type, categoryId });
  };

  const handleViewAllTransactions = () => {
    navigation.navigate('Transactions');
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View className="bg-blue-600 pt-4 pb-8 px-4">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-white text-lg font-medium">
              {getGreeting()}! 👋
            </Text>
            <Text className="text-blue-100 text-sm mt-1">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
             className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center"
             onPress={() => navigation.navigate('Settings')}
           >
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
         <BalanceCard
            balance={{
              balance: balance.total,
              income: balance.income,
              expense: balance.expense,
            }}
          />
      </View>

      {/* Quick Actions */}
      <View className="px-4 -mt-4 mb-6">
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <Text className="text-gray-900 font-semibold text-lg mb-4">
            Aksi Cepat
          </Text>
          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={() => handleAddTransaction('income')}
              className="flex-1 bg-green-50 rounded-xl p-4 mr-2 items-center"
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="add" size={24} color="#059669" />
              </View>
              <Text className="text-green-700 font-semibold text-sm">
                Tambah Pemasukan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleAddTransaction('expense')}
              className="flex-1 bg-red-50 rounded-xl p-4 ml-2 items-center"
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="remove" size={24} color="#DC2626" />
              </View>
              <Text className="text-red-700 font-semibold text-sm">
                Tambah Pengeluaran
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Quick Categories - Expense */}
      {expenseCategories.length > 0 && (
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-gray-900 font-semibold text-lg">
              Kategori Pengeluaran
            </Text>
          </View>
          <QuickCategoryGrid
            categories={expenseCategories}
            onSelectCategory={(category) => handleAddTransaction('expense', category.id)}
            type="expense"
            maxItems={8}
          />
        </View>
      )}

      {/* Recent Transactions */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between px-4 mb-3">
          <Text className="text-gray-900 font-semibold text-lg">
            Transaksi Terbaru
          </Text>
          {getRecentTransactions(5).length > 0 && (
            <TouchableOpacity
              onPress={handleViewAllTransactions}
              className="flex-row items-center"
            >
              <Text className="text-blue-600 font-medium text-sm mr-1">
                Lihat Semua
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#2563EB" />
            </TouchableOpacity>
          )}
        </View>

        {getRecentTransactions(5).length > 0 ? (
          <TransactionList
            transactions={getRecentTransactions(5)}
            categories={categories}
            onTransactionPress={(transaction) =>
               navigation.navigate('EditTransaction', {
                 transactionId: transaction.id!,
               })
             }
          />
        ) : (
          <View className="mx-4 bg-white rounded-xl p-8 items-center border border-gray-100">
            <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="receipt-outline" size={32} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 font-semibold text-lg mb-2">
              Belum Ada Transaksi
            </Text>
            <Text className="text-gray-500 text-center mb-4">
              Mulai catat transaksi keuangan Anda untuk melihat ringkasan di sini
            </Text>
            <TouchableOpacity
              onPress={() => handleAddTransaction('expense')}
              className="bg-blue-600 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">
                Tambah Transaksi Pertama
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Monthly Summary */}
      {getRecentTransactions(5).length > 0 && (
        <View className="mx-4 mb-6 bg-white rounded-xl p-4 border border-gray-100">
          <Text className="text-gray-900 font-semibold text-lg mb-4">
            Ringkasan Bulan Ini
          </Text>
          <View className="flex-row justify-between">
            <View className="flex-1 items-center">
              <Text className="text-gray-500 text-sm mb-1">Total Transaksi</Text>
              <Text className="text-gray-900 font-bold text-xl">
                {getRecentTransactions(5).length}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-gray-500 text-sm mb-1">Pengeluaran Terbesar</Text>
              <Text className="text-red-600 font-bold text-lg">
                {formatCurrency(
                  Math.max(
                    ...getRecentTransactions(5)
                      .filter((t: any) => t.type === 'expense')
                      .map((t: any) => Math.abs(t.amount)),
                    0
                  )
                )}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Bottom Spacing */}
      <View className="h-8" />
    </ScrollView>
  );
};

export default HomeScreen;