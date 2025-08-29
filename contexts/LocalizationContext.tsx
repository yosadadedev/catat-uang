import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

interface LocalizationContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
}

const translations = {
  id: {
    // General
    settings: 'Pengaturan',
    transactions: 'Transaksi',
    reports: 'Laporan',
    categories: 'Kategori',
    
    // Settings Screen
    settingsTitle: 'Pengaturan',
    settingsSubtitle: 'Kelola preferensi aplikasi Anda',
    appPreferences: 'Preferensi Aplikasi',
    notifications: 'Notifikasi',
    notificationsDesc: 'Terima pengingat untuk transaksi',
    darkMode: 'Mode Gelap',
    darkModeDesc: 'Gunakan tema gelap untuk aplikasi',
    language: 'Bahasa',
    languageDesc: 'Pilih bahasa aplikasi',
    categoryManagement: 'Manajemen Kategori',
    categoryManagementDesc: 'Kelola kategori pemasukan dan pengeluaran',
    
    // Reports Screen
    financialReport: 'Laporan Keuangan',
    export: 'Export',
    week: 'Minggu',
    month: 'Bulan',
    year: 'Tahun',
    custom: 'Custom',
    
    // Transactions Screen
    daily: 'Harian',
    weekly: 'Mingguan',
    monthly: 'Bulanan',
    yearly: 'Tahunan',
    income: 'Pemasukan',
    expense: 'Pengeluaran',
    balance: 'Saldo',
    expenseDistribution: 'Distribusi Pengeluaran',
    
    // Category Management
    addCategory: 'Tambah',
    incomeCategories: 'Kategori Pemasukan',
    expenseCategories: 'Kategori Pengeluaran',
    noIncomeCategories: 'Belum ada kategori pemasukan',
    noExpenseCategories: 'Belum ada kategori pengeluaran',
    aboutApp: 'Tentang Aplikasi',
    appName: 'Catatan Keuangan',
    version: 'Versi 1.0.0',
    appDescription: 'Aplikasi sederhana untuk mencatat dan mengelola keuangan pribadi',
    editCategory: 'Edit Kategori',
    categoryName: 'Nama Kategori',
    enterCategoryName: 'Masukkan nama kategori',
    categoryType: 'Jenis Kategori',
    
    // Add Transaction
    addTransaction: 'Tambah Transaksi',
    amount: 'Jumlah',
    description: 'Deskripsi',
    category: 'Kategori',
    date: 'Tanggal',
    cancel: 'Batal',
    save: 'Simpan',
    edit: 'Edit',
    add: 'Tambah',
    noData: 'Tidak ada data',
    
    // Category Modal
    addCategoryTitle: 'Tambah Kategori',
    editCategoryTitle: 'Edit Kategori',
    categoryIcon: 'Icon Kategori',
    categoryColor: 'Warna Kategori',
    
    // Messages
    success: 'Sukses',
    error: 'Error',
    categoryAdded: 'Kategori berhasil ditambahkan',
    categoryUpdated: 'Kategori berhasil diperbarui',
    categoryDeleted: 'Kategori berhasil dihapus',
    deleteConfirm: 'Apakah Anda yakin ingin menghapus kategori ini?',
    delete: 'Hapus',
  },
  en: {
    // General
    settings: 'Settings',
    transactions: 'Transactions',
    reports: 'Reports',
    categories: 'Categories',
    
    // Settings Screen
    settingsTitle: 'Settings',
    settingsSubtitle: 'Manage your app preferences',
    appPreferences: 'App Preferences',
    notifications: 'Notifications',
    notificationsDesc: 'Receive reminders for transactions',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Use dark theme for the app',
    language: 'Language',
    languageDesc: 'Choose app language',
    categoryManagement: 'Category Management',
    categoryManagementDesc: 'Manage income and expense categories',
    
    // Reports Screen
    financialReport: 'Financial Report',
    export: 'Export',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    custom: 'Custom',
    
    // Transactions Screen
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    income: 'Income',
    expense: 'Expense',
    balance: 'Balance',
    expenseDistribution: 'Expense Distribution',
    
    // Category Management
    addCategory: 'Add',
    incomeCategories: 'Income Categories',
    expenseCategories: 'Expense Categories',
    noIncomeCategories: 'No income categories yet',
    noExpenseCategories: 'No expense categories yet',
    aboutApp: 'About App',
    appName: 'Finance Tracker',
    version: 'Version 1.0.0',
    appDescription: 'Simple app for tracking and managing personal finances',
    editCategory: 'Edit Category',
    categoryName: 'Category Name',
    enterCategoryName: 'Enter category name',
    categoryType: 'Category Type',
    
    // Add Transaction
    addTransaction: 'Add Transaction',
    amount: 'Amount',
    description: 'Description',
    category: 'Category',
    date: 'Date',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    add: 'Add',
    noData: 'No data',
    
    // Category Modal
    addCategoryTitle: 'Add Category',
    editCategoryTitle: 'Edit Category',
    categoryIcon: 'Category Icon',
    categoryColor: 'Category Color',
    
    // Messages
    success: 'Success',
    error: 'Error',
    categoryAdded: 'Category added successfully',
    categoryUpdated: 'Category updated successfully',
    categoryDeleted: 'Category deleted successfully',
    deleteConfirm: 'Are you sure you want to delete this category?',
    delete: 'Delete',
  },
};

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState('id');

  useEffect(() => {
    loadLocalePreference();
  }, []);

  const loadLocalePreference = async () => {
    try {
      const savedLocale = await AsyncStorage.getItem('locale');
      if (savedLocale) {
        setLocaleState(savedLocale);
      } else {
        // Use device locale if available, otherwise default to Indonesian
        const deviceLocales = Localization.getLocales();
        const deviceLocale = deviceLocales[0]?.languageCode || 'id';
        const supportedLocale = deviceLocale === 'en' ? 'en' : 'id';
        setLocaleState(supportedLocale);
      }
    } catch (error) {
      console.error('Error loading locale preference:', error);
    }
  };

  const setLocale = async (newLocale: string) => {
    try {
      setLocaleState(newLocale);
      await AsyncStorage.setItem('locale', newLocale);
    } catch (error) {
      console.error('Error saving locale preference:', error);
    }
  };

  const t = (key: string): string => {
    const currentTranslations = translations[locale as keyof typeof translations] || translations.id;
    return currentTranslations[key as keyof typeof currentTranslations] || key;
  };

  return (
    <LocalizationContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};