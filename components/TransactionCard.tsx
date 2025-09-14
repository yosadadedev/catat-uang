import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, Category } from '../database/database';

interface TransactionCardProps {
  transaction: Transaction;
  category?: Category;
  onPress?: () => void;
  onSwipeDelete?: () => void;
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
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  category,
  onPress,
  onSwipeDelete,
}) => {
  const isIncome = transaction.type === 'income';
  const iconName = (category?.icon as keyof typeof Ionicons.glyphMap) || 'ellipsis-horizontal';
  const categoryColor = category?.color || '#6B7280';

  const translateX = useRef(new Animated.Value(0)).current;
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const swipeThreshold = -80;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 50;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) {
        translateX.setValue(Math.max(gestureState.dx, swipeThreshold));
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < swipeThreshold / 2) {
        // Show delete button
        Animated.spring(translateX, {
          toValue: swipeThreshold,
          useNativeDriver: true,
        }).start();
        setIsSwipeActive(true);
      } else {
        // Reset position
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        setIsSwipeActive(false);
      }
    },
  });

  const resetSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    setIsSwipeActive(false);
  };

  return (
    <View className="relative mx-4 mb-2">
      {/* Delete Button Background */}
      {isSwipeActive && (
        <View className="absolute bottom-0 right-3 top-4 h-14 w-16 items-center justify-center rounded-xl bg-red-500">
          <TouchableOpacity
            onPress={() => {
              resetSwipe();
              onSwipeDelete?.();
            }}
            className="h-full w-full items-center justify-center">
            <Ionicons name="trash" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Main Card */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [{ translateX }],
        }}>
        <TouchableOpacity
          onPress={() => {
            if (isSwipeActive) {
              resetSwipe();
            } else {
              onPress?.();
            }
          }}
          className="rounded-xl border border-gray-100 bg-white p-2 shadow-sm"
          activeOpacity={0.7}>
          <View className="flex-row items-center justify-between">
            {/* Left side - Icon and details */}
            <View className="flex-1 flex-row items-center">
              {/* Category Icon */}
              <View
                className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: categoryColor + '20' }}>
                <Ionicons name={iconName} size={24} color={categoryColor} />
              </View>

              {/* Transaction details */}
              <View className="flex-1">
                <Text className="mb-1 text-base font-semibold text-gray-900">
                  {category?.name || 'Kategori tidak ditemukan'}
                </Text>
                {transaction.description && (
                  <Text className="mb-1 text-sm text-gray-500" numberOfLines={1}>
                    {transaction.description}
                  </Text>
                )}
                <Text className="text-xs text-gray-400">{formatDate(transaction.date)}</Text>
              </View>
            </View>

            {/* Right side - Amount */}
            <View className="items-end">
              <Text className={`text-lg font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                {isIncome ? '+' : '-'}
                {formatCurrency(Math.abs(transaction.amount))}
              </Text>
              <View
                className={`mt-1 rounded-full px-2 py-1 ${
                  isIncome ? 'bg-green-100' : 'bg-red-100'
                }`}>
                <Text
                  className={`text-xs font-medium ${isIncome ? 'text-green-700' : 'text-red-700'}`}>
                  {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// Transaction List Component
interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onTransactionPress?: (transaction: Transaction) => void;
  onTransactionSwipeDelete?: (transaction: Transaction) => void;
  emptyMessage?: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  onTransactionPress,
  onTransactionSwipeDelete,
  emptyMessage = 'Belum ada transaksi',
}) => {
  if (transactions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
        <Text className="mt-4 text-lg font-medium text-gray-500">{emptyMessage}</Text>
        <Text className="mt-2 px-8 text-center text-sm text-gray-400">
          Mulai catat transaksi keuangan Anda untuk melihat ringkasan di sini
        </Text>
      </View>
    );
  }

  const renderTransaction = ({ item: transaction }: { item: Transaction }) => {
    const category = categories.find((cat) => cat.id === transaction.category_id);
    return (
      <TransactionCard
        transaction={transaction}
        category={category}
        onPress={() => onTransactionPress?.(transaction)}
        onSwipeDelete={() => onTransactionSwipeDelete?.(transaction)}
      />
    );
  };

  return (
    <FlatList
      data={transactions}
      renderItem={renderTransaction}
      keyExtractor={(item) => item.id!.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 8 }}
      ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
    />
  );
};
