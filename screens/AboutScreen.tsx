import React from 'react';
import {
  View,
  Text,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useTheme } from '../contexts/ThemeContext';
import { DrawerParamList } from '../navigation/AppNavigator';
import { Container } from '../components/Container';
import { ScreenHeader, Card } from '../components/common';

type AboutScreenNavigationProp = DrawerNavigationProp<DrawerParamList, 'About'>;

interface Props {
  navigation: AboutScreenNavigationProp;
}

const AboutScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();



  return (
    <Container>
      <ScreenHeader
        title="Tentang"
        subtitle="Informasi aplikasi"
        onMenuPress={() => navigation.openDrawer()}
      />

      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* App Info Section */}
        <Card>
          <View style={styles.appIconContainer}>
            <View style={[styles.appIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="wallet" size={40} color="white" />
             </View>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>Catat Uang</Text>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>Versi 1.0.0</Text>
          <Text style={[styles.appDescription, { color: colors.textSecondary }]}>
            Aplikasi pencatat keuangan pribadi gratis yang membantu Anda mengelola pemasukan dan pengeluaran dengan mudah dan efisien.
          </Text>
        </Card>

        {/* Features Section */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>✨ Fitur Utama</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="add-circle" size={20} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>Catat transaksi pemasukan dan pengeluaran</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="pie-chart" size={20} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>Laporan keuangan dengan grafik</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="grid" size={20} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>Kelola kategori custom</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="download" size={20} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>Ekspor data ke CSV</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="language" size={20} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>Dukungan multi bahasa</Text>
            </View>
          </View>
        </Card>

        {/* Changelog Section */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📝 Changelog</Text>
          
          <View style={styles.changelogItem}>
            <Text style={[styles.versionTitle, { color: colors.text }]}>Versi 1.0.0</Text>
            <Text style={[styles.releaseDate, { color: colors.textSecondary }]}>31 Januari 2025</Text>
            <View style={styles.changelogList}>
              <View style={styles.changelogEntry}>
                <Text style={[styles.changelogType, { color: '#10B981' }]}>✨ Fitur Baru</Text>
                <Text style={[styles.changelogText, { color: colors.textSecondary }]}>• Pencatatan transaksi pemasukan dan pengeluaran</Text>
                <Text style={[styles.changelogText, { color: colors.textSecondary }]}>• Manajemen kategori custom dengan icon dan warna</Text>
                <Text style={[styles.changelogText, { color: colors.textSecondary }]}>• Laporan keuangan dengan grafik pie chart</Text>
                <Text style={[styles.changelogText, { color: colors.textSecondary }]}>• Ekspor data ke format CSV, XLS, dan PDF</Text>
                <Text style={[styles.changelogText, { color: colors.textSecondary }]}>• Dukungan multi bahasa (Indonesia & English)</Text>
              </View>
            </View>
          </View>
        </Card>



        {/* Copyright */}
        <View style={styles.footer}>
          <Text style={[styles.copyright, { color: colors.textSecondary }]}>
            © 2025 Catat Uang. All rights reserved.
          </Text>
          <Text style={[styles.copyright, { color: colors.textSecondary }]}>
            Made with ❤️ in Indonesia
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = {
  container: {
    flex: 1,
    padding: 16,
  },
  appIconContainer: {
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
    textAlign: 'center' as const,
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 14,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 16,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  changelogItem: {
    marginBottom: 20,
  },
  versionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  releaseDate: {
    fontSize: 14,
    marginBottom: 12,
  },
  changelogList: {
    gap: 12,
  },
  changelogEntry: {
    gap: 4,
  },
  changelogType: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  changelogText: {
    fontSize: 14,
    lineHeight: 18,
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center' as const,
    paddingVertical: 20,
    gap: 4,
  },
  copyright: {
    fontSize: 12,
    textAlign: 'center' as const,
  },
};

export default AboutScreen;