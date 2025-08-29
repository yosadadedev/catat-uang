import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BalanceCardProps {
  balance: {
    income: number;
    expense: number;
    balance: number;
  };
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance }) => {
  return (
    <View className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 mx-4 mt-4 shadow-lg">
      {/* Total Balance */}
      <View className="items-center mb-6">
        <Text className="text-white/80 text-sm font-medium mb-1">Total Saldo</Text>
        <Text className="text-white text-3xl font-bold">
          {formatCurrency(balance.balance)}
        </Text>
      </View>

      {/* Income and Expense */}
      <View className="flex-row justify-between">
        {/* Income */}
        <View className="flex-1 bg-white/10 rounded-xl p-4 mr-2">
          <View className="flex-row items-center mb-2">
            <View className="bg-green-500 rounded-full p-2 mr-3">
              <Ionicons name="arrow-down" size={16} color="white" />
            </View>
            <Text className="text-white/80 text-sm font-medium">Pemasukan</Text>
          </View>
          <Text className="text-white text-lg font-semibold">
            {formatCurrency(balance.income)}
          </Text>
        </View>

        {/* Expense */}
        <View className="flex-1 bg-white/10 rounded-xl p-4 ml-2">
          <View className="flex-row items-center mb-2">
            <View className="bg-red-500 rounded-full p-2 mr-3">
              <Ionicons name="arrow-up" size={16} color="white" />
            </View>
            <Text className="text-white/80 text-sm font-medium">Pengeluaran</Text>
          </View>
          <Text className="text-white text-lg font-semibold">
            {formatCurrency(balance.expense)}
          </Text>
        </View>
      </View>
    </View>
  );
};