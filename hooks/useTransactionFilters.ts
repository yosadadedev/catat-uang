import { useState, useEffect } from 'react';
import { Transaction } from '../database/database';

export type TabType = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type FilterType = 'all' | 'income' | 'expense';
export type SortType = 'newest' | 'oldest';

interface UseTransactionFiltersProps {
  transactions: Transaction[];
  categories: any[];
  startDate?: Date;
  endDate?: Date;
  useCustomDateRange?: boolean;
}

export const useTransactionFilters = ({ transactions, categories, startDate, endDate, useCustomDateRange = false }: UseTransactionFiltersProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortOrder, setSortOrder] = useState<SortType>('newest');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  const getDateRange = (tab: TabType, date: Date) => {
    const start = new Date(date);
    const end = new Date(date);
    
    switch (tab) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'weekly':
        const dayOfWeek = start.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
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

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    
    switch (activeTab) {
      case 'daily':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date | null, tab?: TabType) => {
    if (!date) return '';
    
    const currentTab = tab || activeTab;
    
    switch (currentTab) {
      case 'daily':
        return date.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      
      case 'weekly': {
        // Get start and end of week
        const startOfWeek = new Date(date);
        const dayOfWeek = startOfWeek.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const startDay = startOfWeek.getDate();
        const endDay = endOfWeek.getDate();
        const month = startOfWeek.toLocaleDateString('id-ID', { month: 'short' });
        const year = startOfWeek.getFullYear();
        
        return `${startDay} - ${endDay} ${month} ${year}`;
      }
      
      case 'monthly':
        return date.toLocaleDateString('id-ID', {
          month: 'short',
          year: 'numeric'
        });
      
      case 'yearly':
        return date.getFullYear().toString();
      
      default:
        return date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
    }
  };

  useEffect(() => {
    let filtered = transactions;
    
    // Use custom date range if provided, otherwise use tab-based range
    let start: Date, end: Date;
    if (useCustomDateRange && startDate && endDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      const dateRange = getDateRange(activeTab, selectedDate);
      start = dateRange.start;
      end = dateRange.end;
    }

    // Filter by date range
    filtered = filtered.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      if (isNaN(transactionDate.getTime())) {
        return false;
      }
      return transactionDate >= start && transactionDate <= end;
    });

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(transaction => transaction.category_id === selectedCategory);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredTransactions(filtered);
  }, [transactions, activeTab, selectedDate, filterType, selectedCategory, sortOrder, categories, startDate, endDate, useCustomDateRange]);

  return {
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
    formatDate,
    getDateRange
  };
};