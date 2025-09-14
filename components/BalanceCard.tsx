import React from 'react';
import { View, Text } from 'react-native';

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
    <View className="mx-4 mb-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      {/* Income, Expense, and Balance Cards - Horizontal Layout */}
      <View className="flex-row justify-between space-x-3">
        {/* Total Balance */}
        <View className="flex-1 rounded-lg bg-gray-50 p-3">
          <View className="items-center">
            <Text className="mb-1 text-xs font-medium text-gray-600">Saldo</Text>
            <Text
              className={`text-base font-bold ${
                balance.balance >= 0 ? 'text-gray-900' : 'text-red-600'
              }`}>
              {formatCurrency(balance.balance)}
            </Text>
          </View>
        </View>

        {/* Income */}
        <View className="flex-1 rounded-lg bg-gray-50 p-3">
          <View className="items-center">
            <Text className="mb-1 text-xs font-medium text-gray-600">Pemasukan</Text>
            <Text className="text-base font-bold text-green-600">
              {formatCurrency(balance.income)}
            </Text>
          </View>
        </View>

        {/* Expense */}
        <View className="flex-1 rounded-lg bg-gray-50 p-3">
          <View className="items-center">
            <Text className="mb-1 text-xs font-medium text-gray-600">Pengeluaran</Text>
            <Text className="text-base font-bold text-red-600">
              {formatCurrency(balance.expense)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
