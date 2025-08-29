import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, BarChart, MonthlyTrend, prepareChartData } from '../components/ChartComponent';
// import { DateRangePicker } from '../components/DatePicker';
import { useFinanceStore } from '../store/useStore';
import { Transaction } from '../database/database';

const ReportsScreen = () => {
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);
  const loading = useFinanceStore((state) => state.loading);
  const { loadTransactions } = useFinanceStore();

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year' | 'custom'>('month');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    updateDateRange(selectedPeriod);
  }, [selectedPeriod]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, startDate, endDate]);

  const updateDateRange = (period: 'week' | 'month' | 'year' | 'custom') => {
    const now = new Date();
    let start: Date;
    let end: Date = new Date();

    switch (period) {
      case 'week':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return; // For custom, don't update dates
    }

    setStartDate(start);
    setEndDate(end);
  };

  const filterTransactions = () => {
    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
    setFilteredTransactions(filtered);
  };

  const handleRefresh = async () => {
    await loadTransactions();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateRange = (): string => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };
    return `${startDate.toLocaleDateString('id-ID', options)} - ${endDate.toLocaleDateString('id-ID', options)}`;
  };

  const calculateSummary = () => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return {
      income,
      expense,
      balance: income - expense,
      totalTransactions: filteredTransactions.length,
    };
  };

  const getTopCategories = (type: 'income' | 'expense', limit: number = 5) => {
    const categoryTotals = new Map<number, number>();
    
    filteredTransactions
      .filter(t => t.type === type)
      .forEach(transaction => {
        const current = categoryTotals.get(transaction.category_id) || 0;
        categoryTotals.set(transaction.category_id, current + Math.abs(transaction.amount));
      });

    return Array.from(categoryTotals.entries())
      .map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          category: category?.name || 'Unknown',
          icon: category?.icon || '❓',
          amount,
          percentage: (amount / (type === 'income' ? calculateSummary().income : calculateSummary().expense)) * 100,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  };

  const exportReport = async () => {
    try {
      const summary = calculateSummary();
      const topExpenses = getTopCategories('expense', 3);
      const topIncome = getTopCategories('income', 3);

      const reportText = `
📊 LAPORAN KEUANGAN
${formatDateRange()}

💰 RINGKASAN:
• Total Pemasukan: ${formatCurrency(summary.income)}
• Total Pengeluaran: ${formatCurrency(summary.expense)}
• Saldo: ${formatCurrency(summary.balance)}
• Total Transaksi: ${summary.totalTransactions}

📈 TOP PENGELUARAN:
${topExpenses.map((item, index) => `${index + 1}. ${item.icon} ${item.category}: ${formatCurrency(item.amount)} (${item.percentage.toFixed(1)}%)`).join('\n')}

📉 TOP PEMASUKAN:
${topIncome.map((item, index) => `${index + 1}. ${item.icon} ${item.category}: ${formatCurrency(item.amount)} (${item.percentage.toFixed(1)}%)`).join('\n')}

📱 Dibuat dengan Catatan Keuangan
      `;

      await Share.share({
        message: reportText,
        title: 'Laporan Keuangan',
      });
    } catch (error) {
      Alert.alert('Error', 'Gagal mengekspor laporan');
    }
  };

  const summary = calculateSummary();
  const topExpenses = getTopCategories('expense');
  const topIncome = getTopCategories('income');

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Export Button */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-gray-900">Laporan Keuangan</Text>
          <TouchableOpacity
            onPress={exportReport}
            className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="share" size={16} color="white" />
            <Text className="text-white font-medium ml-2">Export</Text>
          </TouchableOpacity>
        </View>

        {/* Period Selection */}
        <View className="flex-row justify-between mb-4">
          {(['week', 'month', 'year', 'custom'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => {
                if (period === 'custom') {
                  setShowDatePicker(true);
                } else {
                  setSelectedPeriod(period);
                }
              }}
              className={`flex-1 py-2 mx-1 rounded-lg items-center ${
                selectedPeriod === period ? 'bg-blue-600' : 'bg-gray-100'
              }`}
            >
              <Text className={`font-medium ${
                selectedPeriod === period ? 'text-white' : 'text-gray-600'
              }`}>
                {period === 'week' ? 'Minggu' : 
                 period === 'month' ? 'Bulan' : 
                 period === 'year' ? 'Tahun' : 'Custom'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Range Display */}
        <Text className="text-gray-600 text-center">{formatDateRange()}</Text>
      </View>

      {/* Summary Cards */}
      <View className="mx-4 mt-4">
        <View className="flex-row justify-between mb-4">
          <View className="flex-1 bg-green-50 rounded-xl p-4 mr-2 border border-green-100">
            <View className="flex-row items-center mb-2">
              <Ionicons name="trending-up" size={20} color="#059669" />
              <Text className="text-green-700 font-medium ml-2">Pemasukan</Text>
            </View>
            <Text className="text-green-800 text-xl font-bold">
              {formatCurrency(summary.income)}
            </Text>
          </View>
          <View className="flex-1 bg-red-50 rounded-xl p-4 ml-2 border border-red-100">
            <View className="flex-row items-center mb-2">
              <Ionicons name="trending-down" size={20} color="#DC2626" />
              <Text className="text-red-700 font-medium ml-2">Pengeluaran</Text>
            </View>
            <Text className="text-red-800 text-xl font-bold">
              {formatCurrency(summary.expense)}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between">
          <View className="flex-1 bg-blue-50 rounded-xl p-4 mr-2 border border-blue-100">
            <View className="flex-row items-center mb-2">
              <Ionicons name="wallet" size={20} color="#2563EB" />
              <Text className="text-blue-700 font-medium ml-2">Saldo</Text>
            </View>
            <Text className={`text-xl font-bold ${
              summary.balance >= 0 ? 'text-blue-800' : 'text-red-600'
            }`}>
              {formatCurrency(summary.balance)}
            </Text>
          </View>
          <View className="flex-1 bg-gray-50 rounded-xl p-4 ml-2 border border-gray-100">
            <View className="flex-row items-center mb-2">
              <Ionicons name="receipt" size={20} color="#6B7280" />
              <Text className="text-gray-700 font-medium ml-2">Transaksi</Text>
            </View>
            <Text className="text-gray-800 text-xl font-bold">
              {summary.totalTransactions}
            </Text>
          </View>
        </View>
      </View>

      {/* Charts Section */}
      {filteredTransactions.length > 0 ? (
        <>
          {/* Expense Pie Chart */}
           {summary.expense > 0 && (
             <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
               <Text className="text-lg font-bold text-gray-900 mb-4">Distribusi Pengeluaran</Text>
               <PieChart
                 data={prepareChartData(
                   filteredTransactions.filter(t => t.type === 'expense'),
                   categories,
                   'expense'
                 )}
                 size={200}
                 showLegend={true}
               />
             </View>
           )}

          {/* Monthly Trend */}
          <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="text-lg font-bold text-gray-900 mb-4">Tren Bulanan</Text>
            <MonthlyTrend transactions={transactions} />
          </View>

          {/* Top Categories */}
          {topExpenses.length > 0 && (
            <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
              <Text className="text-lg font-bold text-gray-900 mb-4">Top Pengeluaran</Text>
              {topExpenses.map((item, index) => (
                <View key={index} className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-2xl mr-3">{item.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-medium">{item.category}</Text>
                      <Text className="text-gray-500 text-sm">{item.percentage.toFixed(1)}% dari total</Text>
                    </View>
                  </View>
                  <Text className="text-red-600 font-bold">
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {topIncome.length > 0 && (
            <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
              <Text className="text-lg font-bold text-gray-900 mb-4">Top Pemasukan</Text>
              {topIncome.map((item, index) => (
                <View key={index} className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-2xl mr-3">{item.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-medium">{item.category}</Text>
                      <Text className="text-gray-500 text-sm">{item.percentage.toFixed(1)}% dari total</Text>
                    </View>
                  </View>
                  <Text className="text-green-600 font-bold">
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      ) : (
        <View className="bg-white mx-4 mt-4 rounded-xl p-8 items-center shadow-sm border border-gray-100">
          <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="bar-chart-outline" size={32} color="#9CA3AF" />
          </View>
          <Text className="text-gray-900 font-semibold text-lg mb-2">Tidak Ada Data</Text>
          <Text className="text-gray-500 text-center">
            Belum ada transaksi dalam periode yang dipilih
          </Text>
        </View>
      )}

      {/* Date Range Picker Modal */}
       {showDatePicker && (
         <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
           <View className="bg-white rounded-xl p-6 mx-4 w-80">
             <Text className="text-lg font-bold text-gray-900 mb-4">Pilih Rentang Tanggal</Text>
             
             <View className="mb-4">
               <Text className="text-gray-700 font-medium mb-2">Tanggal Mulai:</Text>
               <Text className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                 {startDate.toLocaleDateString('id-ID')}
               </Text>
             </View>
             
             <View className="mb-6">
               <Text className="text-gray-700 font-medium mb-2">Tanggal Akhir:</Text>
               <Text className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                 {endDate.toLocaleDateString('id-ID')}
               </Text>
             </View>
             
             <View className="flex-row justify-end">
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg mr-3"
                >
                  <Text className="text-gray-700 font-medium">Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedPeriod('custom');
                    setShowDatePicker(false);
                  }}
                  className="px-4 py-2 bg-blue-600 rounded-lg"
                >
                  <Text className="text-white font-medium">OK</Text>
                </TouchableOpacity>
              </View>
           </View>
         </View>
       )}

      {/* Bottom Spacing */}
      <View className="h-8" />
    </ScrollView>
  );
};

export default ReportsScreen;