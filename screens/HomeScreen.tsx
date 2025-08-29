import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '../store/useStore';
import { BalanceCard } from '../components/BalanceCard';
import { TransactionList } from '../components/TransactionCard';
import { TabParamList, RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

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
    // For now, we'll just show an alert since we're using tab navigation
    console.log('Add transaction:', type, categoryId);
  };

  const handleTransactionPress = (transaction: any) => {
    // For now, we'll just show an alert since we're using tab navigation
    console.log('Edit transaction:', transaction.id);
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="bg-blue-600 pt-4 pb-4 px-4">
          <View className="flex-row items-center justify-between mb-4">
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
          </View>
        </View>

        {/* Balance Card */}
        <View className="-mt-4">
          <BalanceCard
            balance={{
              balance: balance.total,
              income: balance.income,
              expense: balance.expense,
            }}
          />
        </View>

      {/* Recent Transactions */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between px-4 mb-3">
          <Text className="text-gray-900 font-semibold text-lg">
            Transaksi Terbaru
          </Text>
          {getRecentTransactions(5).length > 0 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Transactions')}
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
            onTransactionPress={handleTransactionPress}
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

      {/* Bottom Spacing */}
      <View className="h-8" />
    </ScrollView>

    {/* Floating Action Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 30,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#3B82F6',
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          zIndex: 1000,
        }}
        onPress={() => navigation.navigate('AddTransaction', {})}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>


  </SafeAreaView>
  );
};

export default HomeScreen;