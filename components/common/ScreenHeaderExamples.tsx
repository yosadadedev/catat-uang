import React from 'react';
import { Alert } from 'react-native';
import { ScreenHeader } from './ScreenHeader';

// Contoh penggunaan ScreenHeader yang dinamis

// 1. Header dengan single button
const HeaderWithSingleButton = () => (
  <ScreenHeader
    title="Transaksi"
    subtitle="Kelola keuangan Anda"
    onMenuPress={() => Alert.alert('Menu pressed')}
    rightButton={{
      icon: 'add',
      onPress: () => Alert.alert('Add pressed'),
      color: 'white',
      size: 24,
    }}
  />
);

// 2. Header dengan multiple buttons
const HeaderWithMultipleButtons = () => (
  <ScreenHeader
    title="Laporan"
    onMenuPress={() => Alert.alert('Menu pressed')}
    rightButton={[
      {
        icon: 'filter',
        onPress: () => Alert.alert('Filter pressed'),
        size: 20,
      },
      {
        icon: 'share',
        onPress: () => Alert.alert('Share pressed'),
        size: 20,
      },
      {
        icon: 'download',
        onPress: () => Alert.alert('Download pressed'),
        size: 20,
      },
    ]}
  />
);

// 3. Header dengan conditional button (disabled state)
const HeaderWithConditionalButton = ({ isLoading }: { isLoading: boolean }) => (
  <ScreenHeader
    title="Pengaturan"
    onMenuPress={() => Alert.alert('Menu pressed')}
    rightButton={{
      icon: 'save',
      onPress: () => Alert.alert('Save pressed'),
      disabled: isLoading,
      backgroundColor: isLoading ? 'rgba(255,255,255,0.1)' : 'rgba(34,197,94,0.3)',
      color: isLoading ? 'rgba(255,255,255,0.5)' : 'white',
    }}
  />
);

// 4. Header tanpa button (rightButton tidak diberikan)
const HeaderWithoutButton = () => (
  <ScreenHeader
    title="Tentang Aplikasi"
    subtitle="Versi 1.0.0"
    onMenuPress={() => Alert.alert('Menu pressed')}
  />
);

// 5. Header dengan custom styling
const HeaderWithCustomStyling = () => (
  <ScreenHeader
    title="Kategori"
    onMenuPress={() => Alert.alert('Menu pressed')}
    backgroundColor="#8B5CF6"
    rightButton={[
      {
        icon: 'create',
        onPress: () => Alert.alert('Edit pressed'),
        backgroundColor: 'rgba(255,255,255,0.3)',
        color: '#FBBF24',
        size: 22,
      },
      {
        icon: 'trash',
        onPress: () => Alert.alert('Delete pressed'),
        backgroundColor: 'rgba(239,68,68,0.3)',
        color: '#FCA5A5',
        size: 20,
      },
    ]}
  />
);

export {
  HeaderWithSingleButton,
  HeaderWithMultipleButtons,
  HeaderWithConditionalButton,
  HeaderWithoutButton,
  HeaderWithCustomStyling,
};
