import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, Category } from '../database/database';

interface TransactionCardProps {
  transaction: Transaction;
  category?: Category;
  onPress?: () => void;
  onLongPress?: () => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Hari ini';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Kemarin';
  } else {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  }
};

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  category,
  onPress,
  onLongPress,
}) => {
  const isIncome = transaction.type === 'income';
  const iconName = category?.icon as keyof typeof Ionicons.glyphMap || 'ellipsis-horizontal';
  const categoryColor = category?.color || '#6B7280';

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      className="bg-white rounded-xl p-4 mx-4 mb-3 shadow-sm border border-gray-100"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        {/* Left side - Icon and details */}
        <View className="flex-row items-center flex-1">
          {/* Category Icon */}
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: categoryColor + '20' }}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={categoryColor}
            />
          </View>

          {/* Transaction details */}
          <View className="flex-1">
            <Text className="text-gray-900 font-semibold text-base mb-1">
              {category?.name || 'Kategori tidak ditemukan'}
            </Text>
            {transaction.description && (
              <Text className="text-gray-500 text-sm mb-1" numberOfLines={1}>
                {transaction.description}
              </Text>
            )}
            <Text className="text-gray-400 text-xs">
              {formatDate(transaction.date)}
            </Text>
          </View>
        </View>

        {/* Right side - Amount */}
        <View className="items-end">
          <Text
            className={`font-bold text-lg ${
              isIncome ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
          </Text>
          <View
            className={`px-2 py-1 rounded-full mt-1 ${
              isIncome ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                isIncome ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {isIncome ? 'Pemasukan' : 'Pengeluaran'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Transaction List Component
interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onTransactionPress?: (transaction: Transaction) => void;
  onTransactionLongPress?: (transaction: Transaction) => void;
  emptyMessage?: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  onTransactionPress,
  onTransactionLongPress,
  emptyMessage = 'Belum ada transaksi',
}) => {
  if (transactions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
        <Text className="text-gray-500 text-lg font-medium mt-4">
          {emptyMessage}
        </Text>
        <Text className="text-gray-400 text-sm mt-2 text-center px-8">
          Mulai catat transaksi keuangan Anda untuk melihat ringkasan di sini
        </Text>
      </View>
    );
  }

  const renderTransaction = ({ item: transaction }: { item: Transaction }) => {
    const category = categories.find(cat => cat.id === transaction.category_id);
    return (
      <TransactionCard
        transaction={transaction}
        category={category}
        onPress={() => onTransactionPress?.(transaction)}
        onLongPress={() => onTransactionLongPress?.(transaction)}
      />
    );
  };

  return (
    <FlatList
      data={transactions}
      renderItem={renderTransaction}
      keyExtractor={(item) => item.id!.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 16 }}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
    />
  );
};