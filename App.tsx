import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { useFinanceStore } from './store/useStore';
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
        <Text className="text-gray-600 mt-4 text-lg">Memuat aplikasi...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-red-600 text-lg font-semibold mb-2">Terjadi Kesalahan</Text>
        <Text className="text-gray-600 text-center">{error}</Text>
      </View>
    );
  }

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}
