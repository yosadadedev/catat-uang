import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '../database/database';
import { Alert, Share } from 'react-native';

interface UseReportDataProps {
  transactions: Transaction[];
  categories: any[];
}

export const useReportData = ({ transactions, categories }: UseReportDataProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  const updateDateRange = (period: 'today' | 'week' | 'month' | 'year') => {
    const now = new Date();
    let start: Date;
    let end: Date = new Date();

    switch (period) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'week':
        // Mulai dari hari Senin minggu ini
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Jika Minggu, mundur 6 hari ke Senin
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday);
        start.setHours(0, 0, 0, 0);
        end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59, 999);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
    }

    setStartDate(start);
    setEndDate(end);
  };

  const filterTransactions = useCallback(() => {
    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
    setFilteredTransactions(filtered);
  }, [transactions, startDate, endDate]);

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
${topExpenses.map((item, index) => `${index + 1}. ${item.category}: ${formatCurrency(item.amount)} (${item.percentage.toFixed(1)}%)`).join('\n')}

📉 TOP PEMASUKAN:
${topIncome.map((item, index) => `${index + 1}. ${item.category}: ${formatCurrency(item.amount)} (${item.percentage.toFixed(1)}%)`).join('\n')}

📱 Dibuat dengan Catat Uang
      `;

      await Share.share({
        message: reportText,
        title: 'Laporan Keuangan',
      });
    } catch {
      Alert.alert('Error', 'Gagal mengekspor laporan');
    }
  };

  useEffect(() => {
    updateDateRange(selectedPeriod);
  }, [selectedPeriod]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, startDate, endDate, filterTransactions]);

  return {
    selectedPeriod,
    setSelectedPeriod,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filteredTransactions,
    updateDateRange,
    filterTransactions,
    formatCurrency,
    formatDateRange,
    calculateSummary,
    getTopCategories,
    exportReport
  };
};