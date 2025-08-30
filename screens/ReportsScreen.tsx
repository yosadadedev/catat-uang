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
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, BarChart, MonthlyTrend, prepareChartData } from '../components/ChartComponent';
// import { DateRangePicker } from '../components/DatePicker';
import { useFinanceStore } from '../store/useStore';
import { Transaction } from '../database/database';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { DrawerParamList } from '../navigation/AppNavigator';

type ReportsScreenNavigationProp = DrawerNavigationProp<DrawerParamList, 'Reports'>;

const ReportsScreen = () => {
  const navigation = useNavigation<ReportsScreenNavigationProp>();
  const { colors } = useTheme();
  const { t } = useLocalization();
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);
  const loading = useFinanceStore((state) => state.loading);
  const { loadTransactions } = useFinanceStore();

  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
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

  const updateDateRange = (period: 'today' | 'week' | 'month' | 'year') => {
    const now = new Date();
    let start: Date;
    let end: Date = new Date();

    switch (period) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
    }

    setStartDate(start);
    setEndDate(end);
  };

  const filterTransactions = () => {
    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      transactionDate.setHours(0, 0, 0, 0);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return transactionDate >= start && transactionDate <= end;
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
    
    const incomeCount = filteredTransactions.filter(t => t.type === 'income').length;
    const expenseCount = filteredTransactions.filter(t => t.type === 'expense').length;
    
    return {
      income,
      expense,
      balance: income - expense,
      totalTransactions: filteredTransactions.length,
      incomeCount,
      expenseCount,
      averageIncome: incomeCount > 0 ? income / incomeCount : 0,
      averageExpense: expenseCount > 0 ? expense / expenseCount : 0
    };
  };

  const getTopCategories = (type: 'income' | 'expense', limit: number = 5) => {
    const categoryTotals = new Map<number, { amount: number; count: number }>();
    
    filteredTransactions
      .filter(t => t.type === type)
      .forEach(transaction => {
        const current = categoryTotals.get(transaction.category_id) || { amount: 0, count: 0 };
        categoryTotals.set(transaction.category_id, {
          amount: current.amount + Math.abs(transaction.amount),
          count: current.count + 1
        });
      });

    const totalAmount = type === 'income' ? calculateSummary().income : calculateSummary().expense;
    const totalCount = filteredTransactions.filter(t => t.type === type).length;

    return Array.from(categoryTotals.entries())
       .map(([categoryId, data]) => {
         const category = categories.find(c => c.id === categoryId);
         return {
           category: category?.name || 'Lainnya',
           icon: category?.icon || 'help-circle',
           color: category?.color || '#6B7280',
           amount: data.amount,
           count: data.count,
           percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
           transactionPercentage: totalCount > 0 ? (data.count / totalCount) * 100 : 0,
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
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#3B82F6',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
              style={{
                marginRight: 12,
                padding: 8,
                borderRadius: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <Ionicons name="menu" size={20} color="white" />
            </TouchableOpacity>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>{t('financialReport')}</Text>
          </View>
          <TouchableOpacity
            onPress={exportReport}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Ionicons name="share" size={16} color="white" />
            <Text style={{ color: 'white', marginLeft: 4, fontSize: 12, fontWeight: '600' }}>{t('export')}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Period Selector */}
        <View style={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: 20,
          padding: 4,
          flexDirection: 'row',
        }}>
          {(['today', 'week', 'month', 'year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 20,
                marginHorizontal: 2,
                backgroundColor: selectedPeriod === period ? 'white' : 'transparent',
                shadowColor: selectedPeriod === period ? '#000' : 'transparent',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: selectedPeriod === period ? 0.1 : 0,
                shadowRadius: 4,
                elevation: selectedPeriod === period ? 3 : 0,
              }}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={{
                fontSize: 13,
                fontWeight: '600',
                color: selectedPeriod === period ? '#3B82F6' : 'rgba(255, 255, 255, 0.8)',
                textAlign: 'center',
              }}>
                {period === 'today' ? t('today') : period === 'week' ? t('week') : period === 'month' ? t('month') : t('year')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >

        {/* Summary Cards */}
        <View style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 8
          }}>
            {/* Income Card */}
            <View style={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: '#DCFCE7',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8
                }}>
                  <Ionicons name="trending-up" size={16} color="#16A34A" />
                </View>
                <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '500' }}>{t('income')}</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#16A34A' }}>{formatCurrency(summary.income)}</Text>
              <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{summary.incomeCount} transaksi</Text>
            </View>
            
            {/* Expense Card */}
            <View style={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: '#FEE2E2',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8
                }}>
                  <Ionicons name="trending-down" size={16} color="#DC2626" />
                </View>
                <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '500' }}>{t('expense')}</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#DC2626' }}>{formatCurrency(summary.expense)}</Text>
              <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{summary.expenseCount} transaksi</Text>
            </View>
          </View>
          
          {/* Net Income Card */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 16,
            marginTop: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 4 }}>{t('balance')}</Text>
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: summary.balance >= 0 ? '#16A34A' : '#DC2626'
                }}>
                  {formatCurrency(summary.balance)}
                </Text>
              </View>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: summary.balance >= 0 ? '#DCFCE7' : '#FEE2E2',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons 
                  name={summary.balance >= 0 ? "trending-up" : "trending-down"} 
                  size={20} 
                  color={summary.balance >= 0 ? '#16A34A' : '#DC2626'} 
                />
              </View>
            </View>
          </View>
        </View>

        {/* Charts Section */}
        {filteredTransactions.length > 0 ? (
          <>
            {/* Expense Pie Chart */}
             {summary.expense > 0 && (
               <View style={{
                 backgroundColor: 'white',
                 marginHorizontal: 16,
                 marginTop: 16,
                 borderRadius: 12,
                 padding: 16,
                 shadowColor: '#000',
                 shadowOffset: { width: 0, height: 1 },
                 shadowOpacity: 0.05,
                 shadowRadius: 2,
                 elevation: 1,
               }}>
                 <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>{t('expenseDistribution')}</Text>
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
            <View style={{
              backgroundColor: 'white',
              marginHorizontal: 16,
              marginTop: 16,
              borderRadius: 12,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Tren Bulanan</Text>
              <MonthlyTrend transactions={transactions} />
            </View>

            {/* Top Categories */}
            {topExpenses.length > 0 && (
              <View style={{
                backgroundColor: 'white',
                marginHorizontal: 16,
                marginTop: 16,
                borderRadius: 12,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Top Pengeluaran</Text>
                 {topExpenses.map((item, index) => (
                   <View key={index} style={{
                     flexDirection: 'row',
                     alignItems: 'center',
                     justifyContent: 'space-between',
                     paddingVertical: 12,
                     borderBottomWidth: index < topExpenses.length - 1 ? 1 : 0,
                     borderBottomColor: '#F3F4F6'
                   }}>
                     <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                       <View style={{
                         width: 40,
                         height: 40,
                         borderRadius: 10,
                         backgroundColor: item.color + '20',
                         alignItems: 'center',
                         justifyContent: 'center',
                         marginRight: 12
                       }}>
                         <Ionicons name={item.icon as any} size={20} color={item.color} />
                       </View>
                       <View style={{ flex: 1 }}>
                         <Text style={{ color: '#111827', fontWeight: '500' }}>{item.category}</Text>
                         <Text style={{ color: '#6B7280', fontSize: 12 }}>{item.percentage.toFixed(1)}% dari total • {item.count} transaksi</Text>
                       </View>
                     </View>
                     <Text style={{ color: '#DC2626', fontWeight: 'bold' }}>
                       {formatCurrency(item.amount)}
                     </Text>
                   </View>
                 ))}
              </View>
            )}

            {topIncome.length > 0 && (
              <View style={{
                backgroundColor: 'white',
                marginHorizontal: 16,
                marginTop: 16,
                borderRadius: 12,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Top Pemasukan</Text>
                 {topIncome.map((item, index) => (
                   <View key={index} style={{
                     flexDirection: 'row',
                     alignItems: 'center',
                     justifyContent: 'space-between',
                     paddingVertical: 12,
                     borderBottomWidth: index < topIncome.length - 1 ? 1 : 0,
                     borderBottomColor: '#F3F4F6'
                   }}>
                     <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                       <View style={{
                         width: 40,
                         height: 40,
                         borderRadius: 10,
                         backgroundColor: item.color + '20',
                         alignItems: 'center',
                         justifyContent: 'center',
                         marginRight: 12
                       }}>
                         <Ionicons name={item.icon as any} size={20} color={item.color} />
                       </View>
                       <View style={{ flex: 1 }}>
                         <Text style={{ color: '#111827', fontWeight: '500' }}>{item.category}</Text>
                         <Text style={{ color: '#6B7280', fontSize: 12 }}>{item.percentage.toFixed(1)}% dari total • {item.count} transaksi</Text>
                       </View>
                     </View>
                     <Text style={{ color: '#16A34A', fontWeight: 'bold' }}>
                       {formatCurrency(item.amount)}
                     </Text>
                   </View>
                 ))}
              </View>
            )}
          </>
        ) : (
          <View style={{
            backgroundColor: 'white',
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 12,
            padding: 32,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}>
            <View style={{
              width: 64,
              height: 64,
              backgroundColor: '#F3F4F6',
              borderRadius: 32,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Ionicons name="bar-chart-outline" size={32} color="#9CA3AF" />
            </View>
            <Text style={{ color: '#111827', fontWeight: '600', fontSize: 18, marginBottom: 8 }}>Tidak Ada Data</Text>
            <Text style={{ color: '#6B7280', textAlign: 'center' }}>
              Belum ada transaksi dalam periode yang dipilih
            </Text>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

export default ReportsScreen;