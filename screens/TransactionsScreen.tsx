import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as XLSX from 'xlsx';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useFinanceStore } from '../store/useStore';
import { TransactionCard } from '../components/TransactionCard';
import { DatePicker } from '../components/DatePicker';
import { Transaction } from '../database/database';

const TransactionsScreen = () => {
  const { transactions, categories, deleteTransaction } = useFinanceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [dateFilter, setDateFilter] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'start' | 'end'>('start');
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    let filtered = transactions;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(transaction => {
        const category = categories.find(cat => cat.id === transaction.category_id);
        return (
          transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category?.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Filter by date range
    if (dateFilter.start || dateFilter.end) {
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const startDate = dateFilter.start ? new Date(dateFilter.start) : null;
        const endDate = dateFilter.end ? new Date(dateFilter.end) : null;
        
        if (startDate && endDate) {
          return transactionDate >= startDate && transactionDate <= endDate;
        } else if (startDate) {
          return transactionDate >= startDate;
        } else if (endDate) {
          return transactionDate <= endDate;
        }
        return true;
      });
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, filterType, categories, dateFilter, sortOrder]);

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

  const handleDateSelect = (date: Date) => {
    if (datePickerType === 'start') {
      setDateFilter(prev => ({ ...prev, start: date }));
    } else {
      setDateFilter(prev => ({ ...prev, end: date }));
    }
    setShowDatePicker(false);
  };

  const clearDateFilter = () => {
    setDateFilter({ start: null, end: null });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      Alert.alert('Error', 'Gagal mengexport ke CSV');
    }
  };

  const getFilterButtonStyle = (type: 'all' | 'income' | 'expense') => {
    const isActive = filterType === type;
    return {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: isActive ? '#3B82F6' : '#F3F4F6',
    };
  };

  const getFilterTextStyle = (type: 'all' | 'income' | 'expense') => {
    const isActive = filterType === type;
    return {
      fontSize: 14,
      fontWeight: '600' as const,
      color: isActive ? 'white' : '#6B7280',
    };
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={{
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB'
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#111827'
          }}>
            Riwayat Transaksi
          </Text>
          
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#3B82F6',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8
            }}
            onPress={() => setShowExportModal(true)}
          >
            <Ionicons name="download-outline" size={16} color="white" />
            <Text style={{
              marginLeft: 4,
              fontSize: 14,
              fontWeight: '600',
              color: 'white'
            }}>
              Export
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#F3F4F6',
          borderRadius: 12,
          paddingHorizontal: 12,
          marginBottom: 12
        }}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 8,
              fontSize: 16,
              color: '#111827'
            }}
            placeholder="Cari transaksi..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          <TouchableOpacity
            style={getFilterButtonStyle('all')}
            onPress={() => setFilterType('all')}
          >
            <Text style={getFilterTextStyle('all')}>Semua</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getFilterButtonStyle('income')}
            onPress={() => setFilterType('income')}
          >
            <Text style={getFilterTextStyle('income')}>Pemasukan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getFilterButtonStyle('expense')}
            onPress={() => setFilterType('expense')}
          >
            <Text style={getFilterTextStyle('expense')}>Pengeluaran</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Date Filter and Sort Controls */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          {/* Date Filter */}
          <View style={{ flex: 1, marginRight: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F3F4F6',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  marginRight: 8,
                  flex: 1
                }}
                onPress={() => {
                  setDatePickerType('start');
                  setShowDatePicker(true);
                }}
              >
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={{
                  marginLeft: 6,
                  fontSize: 12,
                  color: dateFilter.start ? '#111827' : '#9CA3AF'
                }}>
                  {dateFilter.start ? formatDate(dateFilter.start) : 'Dari'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F3F4F6',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  flex: 1
                }}
                onPress={() => {
                  setDatePickerType('end');
                  setShowDatePicker(true);
                }}
              >
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={{
                  marginLeft: 6,
                  fontSize: 12,
                  color: dateFilter.end ? '#111827' : '#9CA3AF'
                }}>
                  {dateFilter.end ? formatDate(dateFilter.end) : 'Sampai'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Clear Date Filter */}
          {(dateFilter.start || dateFilter.end) && (
            <TouchableOpacity
              style={{
                backgroundColor: '#EF4444',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 8,
                marginRight: 8
              }}
              onPress={clearDateFilter}
            >
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          )}

          {/* Sort Toggle */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F3F4F6',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8
            }}
            onPress={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
          >
            <Ionicons 
              name={sortOrder === 'newest' ? 'arrow-down' : 'arrow-up'} 
              size={16} 
              color="#6B7280" 
            />
            <Text style={{
              marginLeft: 4,
              fontSize: 12,
              color: '#6B7280',
              fontWeight: '600'
            }}>
              {sortOrder === 'newest' ? 'Terbaru' : 'Terlama'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction List */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {filteredTransactions.length > 0 ? (
          <View style={{ paddingVertical: 16 }}>
            {filteredTransactions.map((transaction) => (
              <View key={transaction.id} style={{ marginBottom: 12 }}>
                <TransactionCard
                   transaction={transaction}
                   onLongPress={() => handleDeleteTransaction(transaction.id!)}
                 />
              </View>
            ))}
          </View>
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
              {searchQuery || filterType !== 'all' ? 'Tidak ada transaksi ditemukan' : 'Belum ada transaksi'}
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#9CA3AF',
              textAlign: 'center',
              paddingHorizontal: 32
            }}>
              {searchQuery || filterType !== 'all'
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Mulai tambahkan transaksi pertama Anda'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}>
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
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}>
          <View style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 32,
            maxHeight: 400
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#111827'
              }}>
                Pilih Tanggal {datePickerType === 'start' ? 'Mulai' : 'Akhir'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: '#F3F4F6'
                }}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <DatePicker
               date={datePickerType === 'start' ? (dateFilter.start || new Date()) : (dateFilter.end || new Date())}
               onDateChange={handleDateSelect}
             />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TransactionsScreen;