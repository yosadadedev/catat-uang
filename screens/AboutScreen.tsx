import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { DrawerParamList } from '../navigation/AppNavigator';
import { Container } from '../components/Container';

type AboutScreenNavigationProp = DrawerNavigationProp<DrawerParamList, 'About'>;

interface Props {
  navigation: AboutScreenNavigationProp;
}

const AboutScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLocalization();



  return (
    <Container>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tentang </Text>
      </View>

      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* App Info Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
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
        </View>

        {/* Features Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
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
        </View>

        {/* Changelog Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
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
        </View>



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

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  appIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: 'bold',
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
    fontWeight: '600',
    marginBottom: 4,
  },
  changelogText: {
    fontSize: 14,
    lineHeight: 18,
    marginLeft: 8,
  },

  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  copyright: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default AboutScreen;