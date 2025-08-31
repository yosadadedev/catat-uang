import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { ScreenHeader, Card, Button } from '../components/common';
import { DrawerParamList } from '../navigation/AppNavigator';
import { useFinanceStore } from '../store/useStore';

type SettingsScreenNavigationProp = DrawerNavigationProp<DrawerParamList, 'Settings'>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { colors } = useTheme();
  const { locale, setLocale, t } = useLocalization();

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleResetData = async () => {
    try {
      setShowResetModal(false);
      
      // Show loading state
      Alert.alert(
        'Menghapus Data',
        'Sedang menghapus semua data...',
        [],
        { cancelable: false }
      );
      
      // Reset all data using store method
      await useFinanceStore.getState().resetAllData();
      
      // Show success message
      Alert.alert(
        'Berhasil',
        'Semua data telah dihapus. Aplikasi telah direset ke pengaturan awal.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Reset data error:', error);
      Alert.alert(
        'Error',
        'Gagal menghapus data. Silakan coba lagi.',
        [{ text: 'OK' }]
      );
    }
  };



  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title={t('settingsTitle')}
        subtitle={t('settingsSubtitle')}
        onMenuPress={() => navigation.openDrawer()}
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* App Preferences */}
        <Card style={{ marginHorizontal: 16, marginTop: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>{t('appPreferences')}</Text>
        
        <View 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons name="notifications" size={20} color="#F59E0B" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: '#111827', fontWeight: '500' }}>{t('notifications')}</Text>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>{t('notificationsDesc')}</Text>
            </View>
           </View>
           <Switch
             value={notifications}
             onValueChange={setNotifications}
             trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
             thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
           />
         </View>



        <TouchableOpacity
          onPress={() => setShowLanguageModal(true)}
         style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons name="language" size={20} color="#10B981" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: '#111827', fontWeight: '500' }}>{t('language')}</Text>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>{t('languageDesc')}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#6B7280', marginRight: 8 }}>
              {locale === 'id' ? 'Indonesia' : 'English'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}
          onPress={() => setShowResetModal(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons name="trash" size={20} color="#EF4444" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: '#111827', fontWeight: '500' }}>Reset Semua Data</Text>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>Hapus seluruh riwayat transaksi dan pengaturan</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </View>
        </TouchableOpacity>
      </Card>



      {/* Reset Data Modal */}
        <Modal
          visible={showResetModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowResetModal(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20
          }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 8
            }}>
              {/* Icon */}
              <View style={{
                alignItems: 'center',
                marginBottom: 16
              }}>
                <View style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: '#FEE2E2',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <Ionicons name="warning" size={32} color="#DC2626" />
                </View>
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#111827',
                  textAlign: 'center',
                  marginBottom: 8
                }}>
                  Reset Semua Data?
                </Text>
              </View>

              {/* Description */}
              <Text style={{
                fontSize: 16,
                color: '#6B7280',
                textAlign: 'center',
                lineHeight: 24,
                marginBottom: 24
              }}>
                Tindakan ini akan menghapus:
              </Text>

              {/* List of items to be deleted */}
              <View style={{ marginBottom: 24 }}>
                {[
                  'Semua riwayat transaksi',
                  'Kategori kustom yang dibuat',
                  'Pengaturan preferensi',
                  'Data laporan keuangan'
                ].map((item, index) => (
                  <View key={index} style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8
                  }}>
                    <View style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#DC2626',
                      marginRight: 12
                    }} />
                    <Text style={{
                      fontSize: 14,
                      color: '#374151'
                    }}>
                      {item}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={{
                backgroundColor: '#FEF3C7',
                padding: 12,
                borderRadius: 8,
                marginBottom: 24
              }}>
                <Text style={{
                   fontSize: 14,
                   color: '#92400E',
                   textAlign: 'center',
                   fontWeight: '500'
                 }}>
                   ⚠️ Data yang dihapus tidak dapat dikembalikan lagi
                 </Text>
              </View>

              {/* Buttons */}
              <View style={{
                flexDirection: 'row',
                gap: 12
              }}>
                <Button
                  title="Batal"
                  variant="secondary"
                  onPress={() => setShowResetModal(false)}
                  style={{ flex: 1 }}
                />
                
                <Button
                  title="Reset Data"
                  variant="danger"
                  onPress={handleResetData}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Language Selection Modal */}
        <Modal
          visible={showLanguageModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowLanguageModal(false)}
        >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ backgroundColor: colors.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Text style={{ color: colors.primary, fontWeight: '500' }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
                {t('language')}
              </Text>
              <View style={{ width: 60 }} />
            </View>
          </View>

          <View style={{ flex: 1, padding: 16 }}>
            <TouchableOpacity
              onPress={() => {
                setLocale('id');
                setShowLanguageModal(false);
              }}
              style={{
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
                borderWidth: locale === 'id' ? 2 : 1,
                borderColor: locale === 'id' ? colors.primary : colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, marginRight: 12 }}>🇮🇩</Text>
                <View>
                  <Text style={{ color: colors.text, fontWeight: '500', fontSize: 16 }}>Indonesia</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Bahasa Indonesia</Text>
                </View>
              </View>
              {locale === 'id' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setLocale('en');
                setShowLanguageModal(false);
              }}
              style={{
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 12,
                marginBottom: 24,
                borderWidth: locale === 'en' ? 2 : 1,
                borderColor: locale === 'en' ? colors.primary : colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, marginRight: 12 }}>🇺🇸</Text>
                <View>
                  <Text style={{ color: colors.text, fontWeight: '500', fontSize: 16 }}>English</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 14 }}>English (US)</Text>
                </View>
              </View>
              {locale === 'en' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>

            <Button
              title="Tutup"
              variant="secondary"
              onPress={() => setShowLanguageModal(false)}
            />
          </View>
        </View>
      </Modal>

        {/* Bottom Spacing */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;