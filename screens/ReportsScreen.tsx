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
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';

const ReportsScreen = () => {
  const { colors } = useTheme();
  const { t } = useLocalization();
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
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Export Button */}
      <View style={{
        backgroundColor: colors.surface,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.border
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>{t('financialReport')}</Text>
          <TouchableOpacity
            onPress={exportReport}
            style={{
              backgroundColor: '#3B82F6',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Ionicons name="share" size={16} color="white" />
            <Text style={{ color: 'white', fontWeight: '500', marginLeft: 8 }}>{t('export')}</Text>
          </TouchableOpacity>
        </View>

        {/* Period Selection */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
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
              style={{
                flex: 1,
                paddingVertical: 8,
                marginHorizontal: 4,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: selectedPeriod === period ? '#3B82F6' : colors.surface,
                borderWidth: 1,
                borderColor: selectedPeriod === period ? '#3B82F6' : colors.border
              }}
            >
              <Text style={{
                fontWeight: '500',
                color: selectedPeriod === period ? 'white' : colors.text
              }}>
                {period === 'week' ? t('week') : 
                 period === 'month' ? t('month') : 
                 period === 'year' ? t('year') : t('custom')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Range Display */}
        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>{formatDateRange()}</Text>
      </View>

      {/* Summary Cards */}
      <View style={{ marginHorizontal: 16, marginTop: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{
            flex: 1,
            backgroundColor: '#F0FDF4',
            borderRadius: 12,
            padding: 16,
            marginRight: 8,
            borderWidth: 1,
            borderColor: '#BBF7D0'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="trending-up" size={20} color="#059669" />
              <Text style={{ color: '#047857', fontWeight: '500', marginLeft: 8 }}>{t('income')}</Text>
            </View>
            <Text style={{ color: '#065F46', fontSize: 20, fontWeight: 'bold' }}>
              {formatCurrency(summary.income)}
            </Text>
          </View>
          <View style={{
            flex: 1,
            backgroundColor: '#FEF2F2',
            borderRadius: 12,
            padding: 16,
            marginLeft: 8,
            borderWidth: 1,
            borderColor: '#FECACA'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="trending-down" size={20} color="#DC2626" />
              <Text style={{ color: '#B91C1C', fontWeight: '500', marginLeft: 8 }}>{t('expense')}</Text>
            </View>
            <Text style={{ color: '#991B1B', fontSize: 20, fontWeight: 'bold' }}>
              {formatCurrency(summary.expense)}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{
            flex: 1,
            backgroundColor: '#EFF6FF',
            borderRadius: 12,
            padding: 16,
            marginRight: 8,
            borderWidth: 1,
            borderColor: '#DBEAFE'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="wallet" size={20} color="#2563EB" />
              <Text style={{ color: '#1D4ED8', fontWeight: '500', marginLeft: 8 }}>{t('balance')}</Text>
            </View>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: summary.balance >= 0 ? '#1E40AF' : '#DC2626'
            }}>
              {formatCurrency(summary.balance)}
            </Text>
          </View>
          <View style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginLeft: 8,
            borderWidth: 1,
            borderColor: colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="receipt" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.text, fontWeight: '500', marginLeft: 8 }}>{t('transactions')}</Text>
            </View>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>
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
             <View style={{
               backgroundColor: colors.surface,
               marginHorizontal: 16,
               marginTop: 16,
               borderRadius: 12,
               padding: 16,
               shadowColor: '#000',
               shadowOffset: { width: 0, height: 1 },
               shadowOpacity: 0.1,
               shadowRadius: 2,
               elevation: 2,
               borderWidth: 1,
               borderColor: colors.border
             }}>
               <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>{t('expenseDistribution')}</Text>
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