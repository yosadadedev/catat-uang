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
    <View className="bg-white rounded-xl p-4 mx-4 mb-3 shadow-sm border border-gray-100">
       {/* Income, Expense, and Balance Cards - Horizontal Layout */}
       <View className="flex-row justify-between space-x-3">
         {/* Total Balance */}
         <View className="flex-1 bg-gray-50 rounded-lg p-3">
           <View className="items-center">
             <Text className="text-gray-600 text-xs font-medium mb-1">Saldo</Text>
             <Text className={`text-base font-bold ${
               balance.balance >= 0 ? 'text-gray-900' : 'text-red-600'
             }`}>
               {formatCurrency(balance.balance)}
             </Text>
           </View>
         </View>
         
         {/* Income */}
         <View className="flex-1 bg-gray-50 rounded-lg p-3">
           <View className="items-center">
             <Text className="text-gray-600 text-xs font-medium mb-1">Pemasukan</Text>
             <Text className="text-green-600 text-base font-bold">
               {formatCurrency(balance.income)}
             </Text>
           </View>
         </View>
         
         {/* Expense */}
         <View className="flex-1 bg-gray-50 rounded-lg p-3">
           <View className="items-center">
             <Text className="text-gray-600 text-xs font-medium mb-1">Pengeluaran</Text>
             <Text className="text-red-600 text-base font-bold">
               {formatCurrency(balance.expense)}
             </Text>
           </View>
         </View>
       </View>
    </View>
  );
};