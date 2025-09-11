import { useState, useEffect, useMemo } from 'react';
import { Transaction } from '../database/database';

export type TabType = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type FilterType = 'all' | 'income' | 'expense';
export type SortType = 'newest' | 'oldest';

// New types for enhanced view modes
export interface DayData {
  day: number;
  date: Date;
  income: number;
  expense: number;
  balance: number;
  transactions: Transaction[];
}

export interface WeekData {
  week: number;
  startDate: Date;
  endDate: Date;
  income: number;
  expense: number;
  balance: number;
  transactions: Transaction[];
}

export interface MonthData {
  month: number;
  monthName: string;
  year: number;
  income: number;
  expense: number;
  balance: number;
  transactions: Transaction[];
  isCurrentMonth: boolean;
}

export interface YearData {
  year: number;
  income: number;
  expense: number;
  balance: number;
  transactions: Transaction[];
}

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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [dailyData, setDailyData] = useState<DayData[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeekData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [yearlyData, setYearlyData] = useState<YearData[]>([]);

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
    switch (activeTab) {
      case 'daily':
      case 'weekly':
        // Navigate by month for daily and weekly views
        const newMonth = selectedMonth + (direction === 'next' ? 1 : -1);
        let newYear = selectedYear;
        let finalMonth = newMonth;
        
        if (newMonth > 11) {
          finalMonth = 0;
          newYear = selectedYear + 1;
        } else if (newMonth < 0) {
          finalMonth = 11;
          newYear = selectedYear - 1;
        }
        
        setSelectedMonth(finalMonth);
        setSelectedYear(newYear);
        // Update selectedDate to maintain consistency
        const newDate = new Date(newYear, finalMonth, selectedDate.getDate());
        setSelectedDate(newDate);
        break;
      case 'monthly':
        // Navigate by year for monthly view
        const newYearMonthly = selectedYear + (direction === 'next' ? 1 : -1);
        setSelectedYear(newYearMonthly);
        // Update selectedDate to maintain consistency
        const newDateMonthly = new Date(newYearMonthly, selectedMonth, selectedDate.getDate());
        setSelectedDate(newDateMonthly);
        break;
      case 'yearly':
        // For yearly view, we can navigate through years or show total
        const newYearYearly = selectedYear + (direction === 'next' ? 1 : -1);
        setSelectedYear(newYearYearly);
        // Update selectedDate to maintain consistency
        const newDateYearly = new Date(newYearYearly, selectedMonth, selectedDate.getDate());
        setSelectedDate(newDateYearly);
        break;
    }
  };

  const navigateToToday = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear());
    setSelectedDate(today);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getMonthName = (month: number) => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return monthNames[month];
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getWeeksInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    // Calculate weeks starting from Monday
    const weeks: WeekData[] = [];
    let currentWeek = 1;
    let currentDate = 1;
    
    // First week
    const firstWeekStart = firstDayOfWeek === 0 ? -5 : 2 - firstDayOfWeek; // Monday start
    const firstWeekEnd = Math.min(8 - firstDayOfWeek, daysInMonth);
    
    while (currentDate <= daysInMonth) {
      const weekStart = currentDate;
      const weekEnd = Math.min(currentDate + 6, daysInMonth);
      
      const startDate = new Date(year, month, weekStart);
      const endDate = new Date(year, month, weekEnd);
      
      weeks.push({
        week: currentWeek,
        startDate,
        endDate,
        income: 0,
        expense: 0,
        balance: 0,
        transactions: []
      });
      
      currentDate = weekEnd + 1;
      currentWeek++;
      
      if (currentDate > daysInMonth) break;
    }
    
    return weeks;
  };

  const calculateDailyData = (transactions: Transaction[], year: number, month: number): DayData[] => {
    const daysInMonth = getDaysInMonth(year, month);
    const dailyData: DayData[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === year && 
               tDate.getMonth() === month && 
               tDate.getDate() === day;
      });
      
      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      dailyData.push({
        day,
        date,
        income,
        expense,
        balance: income - expense,
        transactions: dayTransactions
      });
    }
    
    return dailyData;
  };

  const calculateWeeklyData = (transactions: Transaction[], year: number, month: number): WeekData[] => {
    const weeks = getWeeksInMonth(year, month);
    
    return weeks.map(week => {
      const weekTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= week.startDate && tDate <= week.endDate;
      });
      
      const income = weekTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = weekTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        ...week,
        income,
        expense,
        balance: income - expense,
        transactions: weekTransactions
      };
    });
  };

  const calculateMonthlyData = (transactions: Transaction[], year: number): MonthData[] => {
    const monthlyData: MonthData[] = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    for (let month = 0; month < 12; month++) {
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === year && tDate.getMonth() === month;
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      monthlyData.push({
        month,
        monthName: getMonthName(month),
        year,
        income,
        expense,
        balance: income - expense,
        transactions: monthTransactions,
        isCurrentMonth: year === currentYear && month === currentMonth
      });
    }
    
    return monthlyData;
  };

  const calculateYearlyData = (transactions: Transaction[]): YearData[] => {
    const yearMap = new Map<number, YearData>();
    
    transactions.forEach(t => {
      const year = new Date(t.date).getFullYear();
      
      if (!yearMap.has(year)) {
        yearMap.set(year, {
          year,
          income: 0,
          expense: 0,
          balance: 0,
          transactions: []
        });
      }
      
      const yearData = yearMap.get(year)!;
      yearData.transactions.push(t);
      
      if (t.type === 'income') {
        yearData.income += t.amount;
      } else {
        yearData.expense += t.amount;
      }
      
      yearData.balance = yearData.income - yearData.expense;
    });
    
    return Array.from(yearMap.values()).sort((a, b) => b.year - a.year);
  };

  // Optimize filtered transactions with useMemo
  const baseFilteredTransactions = useMemo(() => {
    let filtered = transactions;
    
    // Apply category filter first
    if (selectedCategory) {
      filtered = filtered.filter(transaction => transaction.category_id === selectedCategory);
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }
    
    return filtered;
  }, [transactions, selectedCategory, filterType]);

  // Optimize data calculations with useMemo
  const calculatedDailyData = useMemo(() => {
    return calculateDailyData(baseFilteredTransactions, selectedYear, selectedMonth);
  }, [baseFilteredTransactions, selectedYear, selectedMonth]);

  const calculatedWeeklyData = useMemo(() => {
    return calculateWeeklyData(baseFilteredTransactions, selectedYear, selectedMonth);
  }, [baseFilteredTransactions, selectedYear, selectedMonth]);

  const calculatedMonthlyData = useMemo(() => {
    return calculateMonthlyData(baseFilteredTransactions, selectedYear);
  }, [baseFilteredTransactions, selectedYear]);

  const calculatedYearlyData = useMemo(() => {
    return calculateYearlyData(baseFilteredTransactions);
  }, [baseFilteredTransactions]);

  useEffect(() => {
    let filtered = baseFilteredTransactions;

    // Set calculated data based on active tab
    switch (activeTab) {
      case 'daily':
        setDailyData(calculatedDailyData);
        // For filtered transactions, show current month's data
        const monthStart = new Date(selectedYear, selectedMonth, 1);
        const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);
        filtered = filtered.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= monthStart && tDate <= monthEnd;
        });
        break;
        
      case 'weekly':
        setWeeklyData(calculatedWeeklyData);
        // For filtered transactions, show current month's data
        const weekMonthStart = new Date(selectedYear, selectedMonth, 1);
        const weekMonthEnd = new Date(selectedYear, selectedMonth + 1, 0);
        filtered = filtered.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= weekMonthStart && tDate <= weekMonthEnd;
        });
        break;
        
      case 'monthly':
        setMonthlyData(calculatedMonthlyData);
        // For filtered transactions, show current year's data
        filtered = filtered.filter(t => {
          const tDate = new Date(t.date);
          return tDate.getFullYear() === selectedYear;
        });
        break;
        
      case 'yearly':
        setYearlyData(calculatedYearlyData);
        // For filtered transactions, show current year's data
        filtered = filtered.filter(t => {
          const tDate = new Date(t.date);
          return tDate.getFullYear() === selectedYear;
        });
        break;
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredTransactions(filtered);
  }, [activeTab, calculatedDailyData, calculatedWeeklyData, calculatedMonthlyData, calculatedYearlyData, baseFilteredTransactions, selectedMonth, selectedYear, sortOrder]);

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
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    filteredTransactions,
    dailyData,
    weeklyData,
    monthlyData,
    yearlyData,
    navigateDate,
    navigateToToday,
    formatDate,
    getDateRange,
    getMonthName
  };
};