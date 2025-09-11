import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, MonthlyTrend, prepareChartData } from '../components/ChartComponent';
import { ScreenHeader, Card } from '../components/common';
import { useReportData } from '../hooks';
import { useFinanceStore } from '../store/useStore';


import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { DrawerParamList } from '../navigation/AppNavigator';
import { MonthYearPicker } from '../components/MonthYearPicker';
import { useTransactionFilters, TabType } from '../hooks/useTransactionFilters';

type ReportsScreenNavigationProp = DrawerNavigationProp<DrawerParamList, 'Reports'>;
type TimePeriod = 'today' | 'week' | 'month' | 'year';

const ReportsScreen = () => {
  const navigation = useNavigation<ReportsScreenNavigationProp>();
  const { colors } = useTheme();
  const { t } = useLocalization();
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);
  const loading = useFinanceStore((state) => state.loading);
  const { loadTransactions } = useFinanceStore();

  // Date navigation state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [useCustomDateRange, setUseCustomDateRange] = useState(false);
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);

  // Use custom hook for report data logic
  const {
     selectedPeriod,
     setSelectedPeriod,
     startDate,
     endDate,
     setStartDate,
     setEndDate,
     filteredTransactions,
     formatCurrency,
     calculateSummary,
     getTopCategories,
     exportReport
   } = useReportData({ 
     transactions, 
     categories
   });
  
  // Use transaction filters hook for consistency
  const {
    activeTab,
    setActiveTab,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    navigateToToday,
    getMonthName,
    filteredTransactions: tabFilteredTransactions
  } = useTransactionFilters({ 
    transactions, 
    categories, 
    startDate, 
    endDate, 
    useCustomDateRange 
  });

  // Date navigation functions
  const getDateRange = useCallback((period: TimePeriod, date: Date) => {
    const start = new Date(date);
    const end = new Date(date);
    
    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const dayOfWeek = start.getDay();
        const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(start.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'year':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        break;
    }
    
    return { start, end };
  }, []);

  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    
    switch (selectedPeriod) {
      case 'today':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setSelectedDate(newDate);
  }, [selectedDate, selectedPeriod]);

  const updateDateRangeFromSelectedDate = useCallback(() => {
    const { start, end } = getDateRange(selectedPeriod, selectedDate);
    setStartDate(start);
    setEndDate(end);
  }, [selectedDate, selectedPeriod, getDateRange, setStartDate, setEndDate]);

  // Update date range when selectedDate or selectedPeriod changes
  useEffect(() => {
    updateDateRangeFromSelectedDate();
  }, [updateDateRangeFromSelectedDate]);

  // Update date range when period changes
  useEffect(() => {
    const { start, end } = getDateRange(selectedPeriod, selectedDate);
    setStartDate(start);
    setEndDate(end);
  }, [selectedPeriod, selectedDate, getDateRange, setStartDate, setEndDate]);

  // Reset date range to current date when screen is focused
  useFocusEffect(
    useCallback(() => {
      const today = new Date();
      const { start, end } = getDateRange(selectedPeriod, today);
      setSelectedDate(today);
      setStartDate(start);
      setEndDate(end);
      setUseCustomDateRange(false);
    }, [selectedPeriod, getDateRange, setStartDate, setEndDate])
  );

  const formatDateHeader = () => {
    // If using custom date range, show the selected range
    if (useCustomDateRange) {
      const startFormatted = startDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      const endFormatted = endDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      return `${startFormatted} - ${endFormatted}`;
    }
    
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    switch (selectedPeriod) {
      case 'today':
        return selectedDate.toLocaleDateString('id-ID', options);
      case 'week':
        const { start, end } = getDateRange('week', selectedDate);
        const startMonth = start.toLocaleDateString('id-ID', { month: 'long' });
        const endMonth = end.toLocaleDateString('id-ID', { month: 'long' });
        const year = end.getFullYear();
        
        if (start.getMonth() === end.getMonth()) {
          return `${start.getDate()} - ${end.getDate()} ${endMonth} ${year}`;
        } else {
          return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth} ${year}`;
        }
      case 'month':
        return selectedDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      case 'year':
        return selectedDate.getFullYear().toString();
      default:
        return '';
    }
  };

  const handleRefresh = async () => {
    await loadTransactions();
  };

  // Currency and date formatting now handled by custom hook

  // Summary calculation now handled by custom hook

  // Top categories calculation now handled by custom hook

  // Export report function now handled by custom hook

  // Use filtered transactions from tab filter instead of date range filter
   const finalFilteredTransactions = tabFilteredTransactions.length > 0 ? tabFilteredTransactions : filteredTransactions;
   
   // Create a separate report data hook instance for tab-filtered data
   const tabReportData = useReportData({ 
     transactions: finalFilteredTransactions, 
     categories,
     customStartDate: startDate,
     customEndDate: endDate,
     useCustomDateRange: true
   });
   
   const summary = tabReportData.calculateSummary();
   const topExpenses = tabReportData.getTopCategories('expense');
   const topIncome = tabReportData.getTopCategories('income');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title="Laporan Keuangan"
        onMenuPress={() => navigation.openDrawer()}
        rightButton={{
           icon: "share-outline",
           onPress: exportReport
         }}
      />
      
        {/* Tab Bar */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: '#3B82F6',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 0,
        }}>
          <View style={{
            flexDirection: 'row',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: 4,
            flex: 1
          }}>
            {[
              { key: 'daily', label: 'Harian' },
              { key: 'weekly', label: 'Mingguan' },
              { key: 'monthly', label: 'Bulanan' },
              { key: 'yearly', label: 'Tahunan' }
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key as TabType)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 6,
                  backgroundColor: activeTab === tab.key ? 'white' : 'transparent'
                }}
              >
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: activeTab === tab.key ? '#3B82F6' : 'white',
                  textAlign: 'center'
                }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

              {/* Period Selector */}
        <View style={{
          backgroundColor: '#3B82F6',
          padding: 16,
          paddingTop: 0,
        }}>
          {/* Date Navigation */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 8,
            justifyContent: 'space-between'
          }}>
            <TouchableOpacity
              onPress={() => navigateDate('prev')}
              style={{ padding: 4 }}
            >
              <Ionicons name="chevron-back" size={16} color="white" />
            </TouchableOpacity>
            
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              justifyContent: 'center',
              gap: 8
            }}>
              <TouchableOpacity
                onPress={() => setShowMonthYearPicker(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Ionicons name="calendar" size={14} color="white" />
                <Text style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  {formatDateHeader()}
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={() => navigateDate('next')}
              style={{ padding: 4 }}
            >
              <Ionicons name="chevron-forward" size={16} color="white" />
            </TouchableOpacity>
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
            <Card style={{ flex: 1 }}>
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
                <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '500' }}>Pemasukan</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#16A34A' }}>{formatCurrency(summary.income)}</Text>
              <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{summary.incomeCount} transaksi</Text>
            </Card>
            
            {/* Expense Card */}
            <Card style={{ flex: 1 }}>
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
                <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '500' }}>Pengeluaran</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#DC2626' }}>{formatCurrency(summary.expense)}</Text>
              <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{summary.expenseCount} transaksi</Text>
            </Card>
          </View>
          
          {/* Net Income Card */}
          <Card style={{ marginTop: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 4 }}>Saldo</Text>
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
          </Card>
        </View>

        {/* Charts Section */}
        {finalFilteredTransactions.length > 0 ? (
          <>
            {/* Expense Pie Chart */}
             {summary.expense > 0 && (
               <Card style={{ marginHorizontal: 16, marginTop: 0 }}>
                 <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Distribusi Pengeluaran</Text>
                 <PieChart
                   data={prepareChartData(
                     finalFilteredTransactions.filter(t => t.type === 'expense'),
                     categories,
                     'expense'
                   )}
                   size={200}
                   showLegend={true}
                 />
               </Card>
             )}

            {/* Income Pie Chart */}
             {summary.income > 0 && (
               <Card style={{ marginHorizontal: 16, marginTop: 0 }}>
                 <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Distribusi Pemasukan</Text>
                 <PieChart
                   data={prepareChartData(
                     finalFilteredTransactions.filter(t => t.type === 'income'),
                     categories,
                     'income'
                   )}
                   size={200}
                   showLegend={true}
                 />
               </Card>
             )}

            {/* Monthly Trend */}
            <Card style={{ marginHorizontal: 16, marginTop: 0 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Tren Bulanan</Text>
              <MonthlyTrend transactions={transactions} />
            </Card>

            {/* Top Expenses */}
            {topExpenses.length > 0 && (
              <Card style={{ marginHorizontal: 16, marginTop: 0 }}>
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
              </Card>
            )}

            {topIncome.length > 0 && (
              <Card style={{ marginHorizontal: 16, marginTop: 16 }}>
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
              </Card>
            )}
          </>
        ) : (
          <Card style={{ marginHorizontal: 16, marginTop: 16, padding: 32, alignItems: 'center' }}>
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
          </Card>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 32 }} />
      </ScrollView>
      
      {/* Month Year Picker Modal */}
      <Modal
        visible={showMonthYearPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMonthYearPicker(false)}
      >
        <MonthYearPicker
            visible={showMonthYearPicker}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onClose={() => setShowMonthYearPicker(false)}
            onMonthYearChange={(month: number, year: number) => {
              setSelectedMonth(month);
              setSelectedYear(year);
              setShowMonthYearPicker(false);
            }}
          />
      </Modal>
    </View>
  );
};

export default ReportsScreen;