import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Alert, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

// Import screens (will be created later)
import TransactionsScreen from '../screens/TransactionsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CategoryManagementScreen from '../screens/CategoryManagementScreen';
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
  Categories: undefined;
  Help: undefined;
  Share: undefined;
  Gift: undefined;
  About: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Drawer Navigator Component
const DrawerNavigator = () => {
  const { colors } = useTheme();
  
  const handleMenuPress = (menuType: string) => {
    switch (menuType) {
      case 'Help':
        Alert.alert('Bantuan', 'Fitur bantuan akan segera tersedia!');
        break;
      case 'Share':
        Alert.alert('Bagikan', 'Bagikan aplikasi ini ke teman-teman Anda!');
        break;
      case 'Gift':
        Alert.alert('Hadiah untuk Developer', 'Terima kasih atas dukungan Anda!');
        break;
      case 'About':
        Alert.alert('Tentang Aplikasi', 'Catat Uang v1.0\nAplikasi pencatat keuangan pribadi\nDikembangkan dengan React Native');
        break;
    }
  };

  return (
    <Drawer.Navigator
      screenOptions={({ route }) => ({
        drawerIcon: ({ focused, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          let iconColor: string;
          let backgroundColor: string;

          switch (route.name) {
            case 'Transactions':
              iconName = focused ? 'list' : 'list-outline';
              iconColor = '#FFFFFF';
              backgroundColor = '#3B82F6'; // Blue
              break;
            case 'Reports':
              iconName = focused ? 'pie-chart' : 'pie-chart-outline';
              iconColor = '#FFFFFF';
              backgroundColor = '#10B981'; // Green
              break;
            case 'Categories':
              iconName = focused ? 'grid' : 'grid-outline';
              iconColor = '#FFFFFF';
              backgroundColor = '#F59E0B'; // Orange
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              iconColor = '#FFFFFF';
              backgroundColor = '#6B7280'; // Gray
              break;
            case 'Help':
              iconName = focused ? 'help-circle' : 'help-circle-outline';
              iconColor = '#FFFFFF';
              backgroundColor = '#8B5CF6'; // Purple
              break;
            case 'Share':
              iconName = focused ? 'share' : 'share-outline';
              iconColor = '#FFFFFF';
              backgroundColor = '#06B6D4'; // Cyan
              break;
            case 'Gift':
              iconName = focused ? 'gift' : 'gift-outline';
              iconColor = '#FFFFFF';
              backgroundColor = '#EF4444'; // Red
              break;
            case 'About':
              iconName = focused ? 'information-circle' : 'information-circle-outline';
              iconColor = '#FFFFFF';
              backgroundColor = '#84CC16'; // Lime
              break;
            default:
              iconName = 'ellipse-outline';
              iconColor = '#FFFFFF';
              backgroundColor = colors.textSecondary;
          }

          return (
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: backgroundColor,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 8,
            }}>
              <Ionicons name={iconName} size={size - 4} color={iconColor} />
            </View>
          );
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerStyle: {
          backgroundColor: '#3B82F6', // Blue background
          width: 280,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          marginLeft: -8,
          color: '#FFFFFF', // White text for blue background
        },
        headerStyle: {
          backgroundColor: colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: colors.text,
        },
        headerTintColor: colors.primary,
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
        name="Categories"
        component={CategoryManagementScreen}
        options={{
          title: 'Kategori',
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
      <Drawer.Screen
        name="Help"
        component={SettingsScreen}
        options={{
          title: 'Bantuan',
          headerShown: false,
        }}
        listeners={{
          drawerItemPress: (e) => {
            e.preventDefault();
            handleMenuPress('Help');
          },
        }}
      />
      <Drawer.Screen
        name="Share"
        component={SettingsScreen}
        options={{
          title: 'Bagikan ke Teman',
          headerShown: false,
        }}
        listeners={{
          drawerItemPress: (e) => {
            e.preventDefault();
            handleMenuPress('Share');
          },
        }}
      />
      <Drawer.Screen
        name="Gift"
        component={SettingsScreen}
        options={{
          title: 'Hadiah untuk Developer',
          headerShown: false,
        }}
        listeners={{
          drawerItemPress: (e) => {
            e.preventDefault();
            handleMenuPress('Gift');
          },
        }}
      />
      <Drawer.Screen
        name="About"
        component={SettingsScreen}
        options={{
          title: 'Tentang',
          headerShown: false,
        }}
        listeners={{
          drawerItemPress: (e) => {
            e.preventDefault();
            handleMenuPress('About');
          },
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