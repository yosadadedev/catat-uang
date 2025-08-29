import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';

// Import screens (will be created later)
import TransactionsScreen from '../screens/TransactionsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import EditTransactionScreen from '../screens/EditTransactionScreen';

// Navigation types
export type RootStackParamList = {
  MainTabs: undefined;
  AddTransaction: {
    type?: 'income' | 'expense';
    categoryId?: number;
  };
  EditTransaction: {
    transactionId: number;
  };
};

export type DrawerParamList = {
  Transactions: undefined;
  Reports: undefined;
  Settings: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Drawer Navigator Component
const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={({ route }) => ({
        drawerIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Transactions':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Reports':
              iconName = focused ? 'pie-chart' : 'pie-chart-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        drawerActiveTintColor: '#3B82F6',
        drawerInactiveTintColor: '#9CA3AF',
        drawerStyle: {
          backgroundColor: '#FFFFFF',
          width: 280,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          marginLeft: -16,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: '#1F2937',
        },
        headerTintColor: '#3B82F6',
      })}
    >
      <Drawer.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          title: 'Transaksi',
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: 'Laporan',
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Pengaturan',
          headerShown: false,
        }}
      />
    </Drawer.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#1F2937',
          },
          headerTintColor: '#3B82F6',
          cardStyle: {
            backgroundColor: '#F9FAFB',
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={DrawerNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddTransaction"
          component={AddTransactionScreen}
          options={{
            title: 'Tambah Transaksi',
            presentation: 'modal',
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
          }}
        />
        <Stack.Screen
          name="EditTransaction"
          component={EditTransactionScreen}
          options={{
            title: 'Edit Transaksi',
            presentation: 'modal',
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;