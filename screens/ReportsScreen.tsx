import React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, MonthlyTrend, prepareChartData } from '../components/ChartComponent';
import { ScreenHeader, TabFilter, Card } from '../components/common';
import { useReportData } from '../hooks';
import { useFinanceStore } from '../store/useStore';

import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { DrawerParamList } from '../navigation/AppNavigator';

type ReportsScreenNavigationProp = DrawerNavigationProp<DrawerParamList, 'Reports'>;
type TimePeriod = 'week' | 'month' | 'year';

const ReportsScreen = () => {
  const navigation = useNavigation<ReportsScreenNavigationProp>();
  const { colors } = useTheme();
  const { t } = useLocalization();
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);
  const loading = useFinanceStore((state) => state.loading);
  const { loadTransactions } = useFinanceStore();

  // Use custom hook for report data logic
  const {
     selectedPeriod,
     setSelectedPeriod,
     filteredTransactions,
     formatCurrency,
     calculateSummary,
     getTopCategories,
     exportReport
   } = useReportData({ transactions, categories });

  // Date range and filtering logic now handled by custom hook

  const handleRefresh = async () => {
    await loadTransactions();
  };

  // Currency and date formatting now handled by custom hook

  // Summary calculation now handled by custom hook

  // Top categories calculation now handled by custom hook

  // Export report function now handled by custom hook

  const summary = calculateSummary();
  const topExpenses = getTopCategories('expense');
  const topIncome = getTopCategories('income');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title={t('financialReport')}
        onMenuPress={() => navigation.openDrawer()}
        rightButton={{
           icon: "share-outline",
           onPress: exportReport
         }}
      />
      
      {/* Period Selector */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <TabFilter
           options={[
             { key: 'today', label: 'Harian' },
             { key: 'week', label: 'Minggu' },
             { key: 'month', label: 'Bulanan' },
             { key: 'year', label: 'Tahunan' }
           ]}
           activeTab={selectedPeriod}
           onTabChange={(tab) => setSelectedPeriod(tab as TimePeriod)}
         />
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
                <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '500' }}>{t('income')}</Text>
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
                <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '500' }}>{t('expense')}</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#DC2626' }}>{formatCurrency(summary.expense)}</Text>
              <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{summary.expenseCount} transaksi</Text>
            </Card>
          </View>
          
          {/* Net Income Card */}
          <Card style={{ marginTop: 8 }}>
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
          </Card>
        </View>

        {/* Charts Section */}
        {filteredTransactions.length > 0 ? (
          <>
            {/* Expense Pie Chart */}
             {summary.expense > 0 && (
               <Card style={{ marginHorizontal: 16, marginTop: 16 }}>
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
               </Card>
             )}

            {/* Monthly Trend */}
            <Card style={{ marginHorizontal: 16, marginTop: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Tren Bulanan</Text>
              <MonthlyTrend transactions={transactions} />
            </Card>

            {/* Top Categories */}
            {topExpenses.length > 0 && (
              <Card style={{ marginHorizontal: 16, marginTop: 16 }}>
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
    </View>
  );
};



export default ReportsScreen;