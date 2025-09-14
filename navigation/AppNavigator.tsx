import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Alert, View, Linking } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

// Import screens (will be created later)
import TransactionsScreen from '../screens/TransactionsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CategoryManagementScreen from '../screens/CategoryManagementScreen';

import HelpScreen from '../screens/HelpScreen';
import AboutScreen from '../screens/AboutScreen';

// Navigation types
export type RootStackParamList = {
  MainTabs: undefined;
};

export type DrawerParamList = {
  Transactions: undefined;
  Reports: undefined;
  Settings: undefined;
  Categories: undefined;
  Help: undefined;
  Share: undefined;
  Gift: undefined;
  Rating: undefined;
  About: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Drawer Navigator Component
const DrawerNavigator = () => {
  const { colors } = useTheme();

  const handleMenuPress = (menuType: string) => {
    switch (menuType) {
      case 'Share':
        Alert.alert('Bagikan', 'Bagikan aplikasi ini ke teman-teman Anda!');
        break;
      case 'Gift':
        Alert.alert('Hadiah untuk Developer', 'Terima kasih atas dukungan Anda!');
        break;
      case 'Rating':
        Alert.alert(
          'Rating Aplikasi',
          'Terima kasih telah menggunakan Catat Uang. Bantu kami berkembang dengan memberi rating ⭐⭐⭐⭐⭐ di Play Store 🙏',
          [
            { text: 'Nanti Saja', style: 'cancel' },
            {
              text: 'Beri Rating ⭐',
              onPress: () => {
                const storeUrl = 'https://play.google.com/store/apps/details?id=com.catatuang.app';
                Linking.canOpenURL(storeUrl)
                  .then((supported) => {
                    if (supported) {
                      Linking.openURL(storeUrl);
                    } else {
                      Alert.alert('Error', 'Tidak dapat membuka store');
                    }
                  })
                  .catch(() => {
                    Alert.alert('Error', 'Gagal membuka store');
                  });
              },
            },
          ]
        );
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
            case 'Rating':
              iconName = focused ? 'star' : 'star-outline';
              iconColor = '#FFFFFF';
              backgroundColor = '#F59E0B'; // Orange/Gold
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
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: backgroundColor,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 8,
                opacity: focused ? 1 : 0.8,
                transform: [{ scale: focused ? 1.05 : 1 }],
                shadowColor: focused ? backgroundColor : 'transparent',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: focused ? 0.3 : 0,
                shadowRadius: 4,
                elevation: focused ? 4 : 0,
              }}>
              <Ionicons name={iconName} size={size - 4} color={iconColor} />
            </View>
          );
        },
        drawerActiveTintColor: '#FFFFFF',
        drawerInactiveTintColor: 'rgba(255, 255, 255, 0.7)',
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
        drawerItemStyle: {
          borderRadius: 12,
          marginHorizontal: 4,
          marginVertical: 4,
          paddingVertical: 4,
        },
        drawerActiveBackgroundColor: 'rgba(255, 255, 255, 0.15)',
        drawerInactiveBackgroundColor: 'transparent',
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
      })}>
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
        component={HelpScreen}
        options={{
          title: 'Bantuan',
          headerShown: false,
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
      {/* <Drawer.Screen
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
      /> */}
      <Drawer.Screen
        name="Rating"
        component={SettingsScreen}
        options={{
          title: 'Rating Aplikasi',
          headerShown: false,
        }}
        listeners={{
          drawerItemPress: (e) => {
            e.preventDefault();
            handleMenuPress('Rating');
          },
        }}
      />
      <Drawer.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: 'Tentang',
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
        }}>
        <Stack.Screen
          name="MainTabs"
          component={DrawerNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
