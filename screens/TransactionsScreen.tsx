import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation, CompositeNavigationProp, useFocusEffect } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import * as XLSX from 'xlsx';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useFinanceStore } from '../store/useStore';
import { TransactionList } from '../components/TransactionCard';
import TransactionModal from '../components/TransactionModal';
import { ScreenHeader } from '../components/common';
import { useTransactionFilters, TabType, FilterType } from '../hooks';
import { Transaction } from '../database/database';
import { DrawerParamList, RootStackParamList } from '../navigation/AppNavigator';
import { DateRangePicker } from '~/components/DatePicker';

type TransactionsScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'Transactions'>,
  StackNavigationProp<RootStackParamList>
>;

const TransactionsScreen = () => {
  const navigation = useNavigation<TransactionsScreenNavigationProp>();
  const { transactions, categories, deleteTransaction } = useFinanceStore();
  
  // Date range state for DateRangePicker
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [useCustomDateRange, setUseCustomDateRange] = useState(false);
  
  // Use custom hook for transaction filtering logic
  const {
    activeTab,
    setActiveTab,
    filterType,
    setFilterType,
    sortOrder,
    setSortOrder,
    selectedCategory,
    setSelectedCategory,
    selectedDate,
    setSelectedDate,
    filteredTransactions,
    navigateDate,
    formatDate
  } = useTransactionFilters({ 
    transactions, 
    categories, 
    startDate, 
    endDate, 
    useCustomDateRange 
  });
  
  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilterType, setTempFilterType] = useState<FilterType>('all');
  const [tempSelectedCategory, setTempSelectedCategory] = useState<number | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Reset date range to current date when screen is focused
  useFocusEffect(
    useCallback(() => {
      const today = new Date();
      setStartDate(today);
      setEndDate(today);
      setUseCustomDateRange(false);
    }, [])
  );

  const getDateRange = (tab: TabType, date: Date) => {
    const start = new Date(date);
    const end = new Date(date);
    
    switch (tab) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'weekly':
        // Mulai dari hari Senin (1) bukan Minggu (0)
        const dayOfWeek = start.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Jika Minggu, mundur 6 hari ke Senin
        start.setDate(start.getDate() - daysToMonday);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'monthly':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(start.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'yearly':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        break;
    }
    
    return { start, end };
  };

  // Filter and sort transactions handled by custom hook

  const handleDeleteTransaction = (transactionId: number) => {
    Alert.alert(
      'Hapus Transaksi',
      'Apakah Anda yakin ingin menghapus transaksi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => deleteTransaction(transactionId),
        },
      ]
    );
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowTransactionModal(true);
  };

  const handleCloseTransactionModal = () => {
    setShowTransactionModal(false);
    setEditingTransaction(null);
  };

  const exportToXLS = async () => {
    try {
      const data = filteredTransactions.map(transaction => {
        const category = categories.find(cat => cat.id === transaction.category_id);
        return {
          'Tanggal': formatDate(new Date(transaction.date)),
          'Deskripsi': transaction.description,
          'Kategori': category?.name || '',
          'Jenis': transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
          'Jumlah': transaction.amount
        };
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');
      
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const uri = FileSystem.documentDirectory + 'transaksi.xlsx';
      
      await FileSystem.writeAsStringAsync(uri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      await Sharing.shareAsync(uri);
      setShowExportModal(false);
    } catch {
      Alert.alert('Error', 'Gagal mengexport ke Excel');
    }
  };

  const exportToPDF = async () => {
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .income { color: #10B981; }
              .expense { color: #EF4444; }
            </style>
          </head>
          <body>
            <h1>Laporan Transaksi</h1>
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Deskripsi</th>
                  <th>Kategori</th>
                  <th>Jenis</th>
                  <th>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTransactions.map(transaction => {
                  const category = categories.find(cat => cat.id === transaction.category_id);
                  const isIncome = transaction.type === 'income';
                  return `
                    <tr>
                      <td>${formatDate(new Date(transaction.date))}</td>
                      <td>${transaction.description}</td>
                      <td>${category?.name || ''}</td>
                      <td class="${isIncome ? 'income' : 'expense'}">${isIncome ? 'Pemasukan' : 'Pengeluaran'}</td>
                      <td class="${isIncome ? 'income' : 'expense'}">Rp ${transaction.amount.toLocaleString('id-ID')}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
      setShowExportModal(false);
    } catch {
      Alert.alert('Error', 'Gagal mengexport ke PDF');
    }
  };

  const exportToCSV = async () => {
    try {
      const csvHeader = 'Tanggal,Deskripsi,Kategori,Jenis,Jumlah\n';
      const csvData = filteredTransactions.map(transaction => {
        const category = categories.find(cat => cat.id === transaction.category_id);
        return [
          formatDate(new Date(transaction.date)),
          `"${transaction.description}"`,
          `"${category?.name || ''}"`,
          transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
          transaction.amount
        ].join(',');
      }).join('\n');
      
      const csvContent = csvHeader + csvData;
      const uri = FileSystem.documentDirectory + 'transaksi.csv';
      
      await FileSystem.writeAsStringAsync(uri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      await Sharing.shareAsync(uri);
      setShowExportModal(false);
    } catch {
      Alert.alert('Error', 'Gagal mengexport ke CSV');
    }
  };

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
    
    switch (activeTab) {
      case 'daily':
        return selectedDate.toLocaleDateString('id-ID', options);
      case 'weekly':
        const { start, end } = getDateRange('weekly', selectedDate);
        const startMonth = start.toLocaleDateString('id-ID', { month: 'long' });
        const endMonth = end.toLocaleDateString('id-ID', { month: 'long' });
        const year = end.getFullYear();
        
        if (start.getMonth() === end.getMonth()) {
          return `${start.getDate()} - ${end.getDate()} ${endMonth} ${year}`;
        } else {
          return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth} ${year}`;
        }
      case 'monthly':
        return selectedDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      case 'yearly':
        return selectedDate.getFullYear().toString();
      default:
        return '';
    }
  };



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#3B82F6'}}>
      <ScreenHeader
          title="Transaksi"
          onMenuPress={() => navigation.openDrawer()}
          rightButton={[
          {
            icon: sortOrder === 'newest' ? 'arrow-down' : 'arrow-up',
            onPress: () => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')
          },
          {
            icon: "download",
            onPress: () => setShowExportModal(true),
            size: 20
          },
          {
            icon: "filter",
            onPress: () => setShowFilterModal(true),
            backgroundColor:  selectedCategory !== null ? '#10B981' : 'rgba(255,255,255,0.2)'
          },
        ]}
        />
      {/* Filter Toolbar */}
      <View style={{
        backgroundColor: '#3B82F6',
        paddingHorizontal: 16,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
          gap: 12
        }}>
          <View style={{
            flex: 1,
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
                onPress={() => setShowDatePicker(true)}
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



      </View>

      {/* Content */}
      <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        {/* Summary Cards */}
        <View style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#F9FAFB'
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 8
          }}>
            {/* Total Pemasukan */}
            <View style={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 4
              }}>
                <Ionicons name="trending-up" size={12} color="#10B981" style={{ marginRight: 4 }} />
                <Text style={{
                  fontSize: 10,
                  color: '#6B7280',
                  fontWeight: '500'
                }}>
                  Total Pemasukan
                </Text>
              </View>
              <Text style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: '#10B981'
              }}>
                Rp {filteredTransactions
                  .filter(t => t.type === 'income')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString('id-ID')}
              </Text>
            </View>

            {/* Total Pengeluaran */}
            <View style={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 4
              }}>
                <Ionicons name="trending-down" size={12} color="#EF4444" style={{ marginRight: 4 }} />
                <Text style={{
                  fontSize: 10,
                  color: '#6B7280',
                  fontWeight: '500'
                }}>
                  Total Pengeluaran
                </Text>
              </View>
              <Text style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: '#EF4444'
              }}>
                Rp {filteredTransactions
                  .filter(t => t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString('id-ID')}
              </Text>
            </View>

            {/* Saldo */}
            <View style={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 4
              }}>
                <Ionicons name="wallet" size={12} color="#6B7280" style={{ marginRight: 4 }} />
                <Text style={{
                  fontSize: 10,
                  color: '#6B7280',
                  fontWeight: '500'
                }}>
                  Saldo
                </Text>
              </View>
              <Text style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: (() => {
                  const balance = filteredTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0) -
                    filteredTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                  return balance >= 0 ? '#10B981' : '#EF4444';
                })()
              }}>
                Rp {(() => {
                  const balance = filteredTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0) -
                    filteredTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                  return Math.abs(balance).toLocaleString('id-ID');
                })()}
              </Text>
            </View>
          </View>
        </View>

        {/* Transaction List */}
        <View style={{ flex: 1, marginTop: 0 }}>
          {filteredTransactions.length > 0 ? (
            <TransactionList
              transactions={filteredTransactions}
              categories={categories}
              onTransactionPress={(transaction) => {
                handleEditTransaction(transaction);
              }}
              onTransactionSwipeDelete={(transaction) => handleDeleteTransaction(transaction.id!)}
            />
          ) : (
            <View style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 64
            }}>
              <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#6B7280',
                marginTop: 16,
                marginBottom: 8
              }}>
                {selectedCategory ? 'Tidak ada transaksi ditemukan' : 'Belum ada transaksi'}
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#9CA3AF',
                textAlign: 'center',
                paddingHorizontal: 32
              }}>
                {selectedCategory
                  ? 'Coba ubah filter yang dipilih'
                  : 'Mulai tambahkan transaksi pertama Anda'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity 
           style={{
             flex: 1,
             justifyContent: 'flex-end',
             backgroundColor: 'rgba(0, 0, 0, 0.5)'
           }}
           activeOpacity={1}
           onPress={() => {
             setTempFilterType(filterType);
             setTempSelectedCategory(selectedCategory);
             setShowFilterModal(false);
           }}
         >
           <TouchableOpacity activeOpacity={1} onPress={() => {}}
             style={{
               backgroundColor: 'white',
               borderTopLeftRadius: 24,
               borderTopRightRadius: 24,
               paddingHorizontal: 16,
               paddingTop: 16,
               paddingBottom: 8,
               maxHeight: '80%',
             }}
           >
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#111827'
              }}>
                Filter Transaksi
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setTempFilterType(filterType);
                  setTempSelectedCategory(selectedCategory);
                  setShowFilterModal(false);
                }}
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: '#F3F4F6'
                }}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            {/* Type Filter Section */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#111827',
                marginBottom: 12
              }}>
                Jenis Transaksi
              </Text>
              <View style={{
                flexDirection: 'row',
                backgroundColor: '#F3F4F6',
                borderRadius: 8,
                padding: 4
              }}>
                <TouchableOpacity
                  onPress={() => {
                    setTempFilterType('all');
                    setTempSelectedCategory(null);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: tempFilterType === 'all' ? '#2563EB' : 'transparent',
                    borderRadius: 6,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Ionicons 
                    name="list" 
                    size={14} 
                    color={tempFilterType === 'all' ? 'white' : '#6B7280'} 
                    style={{ marginRight: 4 }}
                  />
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: tempFilterType === 'all' ? 'white' : '#6B7280'
                  }}>
                    Semua
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setTempFilterType('income');
                    setTempSelectedCategory(null);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: tempFilterType === 'income' ? '#10B981' : 'transparent',
                    borderRadius: 6,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Ionicons 
                    name="trending-up" 
                    size={14} 
                    color={tempFilterType === 'income' ? 'white' : '#6B7280'} 
                    style={{ marginRight: 4 }}
                  />
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: tempFilterType === 'income' ? 'white' : '#6B7280'
                  }}>
                    Pemasukan
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setTempFilterType('expense');
                    setTempSelectedCategory(null);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: tempFilterType === 'expense' ? '#EF4444' : 'transparent',
                    borderRadius: 6,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Ionicons 
                    name="trending-down" 
                    size={14} 
                    color={tempFilterType === 'expense' ? 'white' : '#6B7280'} 
                    style={{ marginRight: 4 }}
                  />
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: tempFilterType === 'expense' ? 'white' : '#6B7280'
                  }}>
                    Pengeluaran
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Category Filter Section */}
            <View style={{ marginBottom: 0 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#111827',
                marginBottom: 12
              }}>
                Kategori
              </Text>
              <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                <View style={{ gap: 8 }}>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: !tempSelectedCategory ? '#F0F9FF' : '#F9FAFB',
                      borderRadius: 10,
                      padding: 12,
                      borderWidth: !tempSelectedCategory ? 2 : 1,
                      borderColor: !tempSelectedCategory ? '#3B82F6' : '#E5E7EB'
                    }}
                    onPress={() => setTempSelectedCategory(null)}
                  >
                    <View style={{
                      backgroundColor: '#6B7280',
                      borderRadius: 6,
                      padding: 6,
                      marginRight: 10
                    }}>
                      <Ionicons name="apps" size={16} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: '#111827'
                      }}>
                        Semua Kategori
                      </Text>
                    </View>
                    {!tempSelectedCategory && (
                      <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />
                    )}
                  </TouchableOpacity>
                  {categories.filter(category => category.type === tempFilterType)
                    .map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: tempSelectedCategory === category.id ? '#F0F9FF' : '#F9FAFB',
                        borderRadius: 10,
                        padding: 12,
                        borderWidth: tempSelectedCategory === category.id ? 2 : 1,
                        borderColor: tempSelectedCategory === category.id ? '#3B82F6' : '#E5E7EB'
                      }}
                      onPress={() => setTempSelectedCategory(category.id!)}
                    >
                      <View style={{
                         marginRight: 10
                       }}>
                         <Ionicons 
                           name={category.icon as any} 
                           size={20} 
                           color={category.color} 
                         />
                       </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: '#111827'
                        }}>
                          {category.name}
                        </Text>
                      </View>
                      {tempSelectedCategory === category.id && (
                        <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Action Buttons */}
            <View style={{
              flexDirection: 'row',
              gap: 12,
              marginTop: 16,
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#FEE2E2',
                  borderRadius: 10,
                  padding: 12,
                  alignItems: 'center'
                }}
                onPress={() => {
                  setTempFilterType('all');
                  setTempSelectedCategory(null);
                  setFilterType('all');
                  setSelectedCategory(null);
                  setShowFilterModal(false);
                }}
              >
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#DC2626'
                }}>
                  Reset
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#3B82F6',
                  borderRadius: 10,
                  padding: 12,
                  alignItems: 'center'
                }}
                onPress={() => {
                  setFilterType(tempFilterType);
                  setSelectedCategory(tempSelectedCategory);
                  setShowFilterModal(false);
                }}
              >
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: 'white'
                }}>
                  Terapkan
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExportModal(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          activeOpacity={1}
          onPress={() => setShowExportModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
          <View style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 32
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#111827'
              }}>
                Export Transaksi
              </Text>
              <TouchableOpacity
                onPress={() => setShowExportModal(false)}
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: '#F3F4F6'
                }}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F3F4F6',
                  borderRadius: 12,
                  padding: 16
                }}
                onPress={exportToXLS}
              >
                <View style={{
                  backgroundColor: '#10B981',
                  borderRadius: 8,
                  padding: 8,
                  marginRight: 12
                }}>
                  <Ionicons name="document-outline" size={20} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: 2
                  }}>
                    Export ke Excel (XLS)
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: '#6B7280'
                  }}>
                    Format spreadsheet untuk analisis data
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F3F4F6',
                  borderRadius: 12,
                  padding: 16
                }}
                onPress={exportToPDF}
              >
                <View style={{
                  backgroundColor: '#EF4444',
                  borderRadius: 8,
                  padding: 8,
                  marginRight: 12
                }}>
                  <Ionicons name="document-text-outline" size={20} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: 2
                  }}>
                    Export ke PDF
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: '#6B7280'
                  }}>
                    Format dokumen untuk laporan
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F3F4F6',
                  borderRadius: 12,
                  padding: 16
                }}
                onPress={exportToCSV}
              >
                <View style={{
                  backgroundColor: '#3B82F6',
                  borderRadius: 8,
                  padding: 8,
                  marginRight: 12
                }}>
                  <Ionicons name="grid-outline" size={20} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: 2
                  }}>
                    Export ke CSV
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: '#6B7280'
                  }}>
                    Format data terpisah koma
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onClose={() => setShowDatePicker(false)}
            onApply={() => setUseCustomDateRange(true)}
          />
        </Modal>
      )}
    
      {/* Floating Action Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 30,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#3B82F6',
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          zIndex: 1000,
        }}
        onPress={handleAddTransaction}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Transaction Modal */}
      <TransactionModal
        visible={showTransactionModal}
        onClose={handleCloseTransactionModal}
        transaction={editingTransaction}
      />
    </SafeAreaView>
  );
};



export default TransactionsScreen;