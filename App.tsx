import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { useFinanceStore } from './store/useStore';
import { ThemeProvider } from './contexts/ThemeContext';
import { LocalizationProvider } from './contexts/LocalizationContext';
import './global.css';

export default function App() {
  const initializeApp = useFinanceStore((state) => state.initializeApp);
  const loading = useFinanceStore((state) => state.loading);
  const error = useFinanceStore((state) => state.error);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-lg text-gray-600">Memuat aplikasi...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="mb-2 text-lg font-semibold text-red-600">Terjadi Kesalahan</Text>
        <Text className="text-center text-gray-600">{error}</Text>
      </View>
    );
  }

  return (
    <LocalizationProvider>
      <ThemeProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </LocalizationProvider>
  );
}
