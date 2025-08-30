import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
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

  const handleEmailPress = () => {
    const email = 'yosadadev@gmail.com';
    const subject = 'Feedback Aplikasi Catat Uang';
    const body = 'Halo Developer,\n\nSaya ingin memberikan feedback tentang aplikasi Catat Uang:\n\n';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(mailtoUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(mailtoUrl);
        } else {
          Alert.alert(
            'Email Tidak Tersedia',
            'Aplikasi email tidak ditemukan. Silakan kirim email ke: yosadadev@gmail.com',
            [{ text: 'OK' }]
          );
        }
      })
      .catch(() => {
        Alert.alert(
          'Error',
          'Gagal membuka aplikasi email. Silakan kirim email ke: yosadadev@gmail.com',
          [{ text: 'OK' }]
        );
      });
  };



  const handleLinkedInPress = () => {
    const linkedinUrl = 'https://www.linkedin.com/in/yosadade';
    Linking.canOpenURL(linkedinUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(linkedinUrl);
        } else {
          Alert.alert(
            'Browser Tidak Tersedia',
            'Tidak dapat membuka browser. URL: ' + linkedinUrl,
            [{ text: 'OK' }]
          );
        }
      })
      .catch(() => {
        Alert.alert('Error', 'Gagal membuka link LinkedIn', [{ text: 'OK' }]);
      });
  };

  return (
    <Container>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tentang</Text>
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

        {/* Developer Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>👨‍💻 Tentang Developer</Text>
          <View style={styles.developerInfo}>
            <View style={[styles.developerAvatar, { backgroundColor: colors.primary }]}>
              <Ionicons name="person" size={30} color="white" />
            </View>
            <View style={styles.developerDetails}>
              <Text style={[styles.developerName, { color: colors.text }]}>Yosada Dede</Text>
              <Text style={[styles.developerRole, { color: colors.textSecondary }]}>Mobile App Developer</Text>
              <Text style={[styles.developerLocation, { color: colors.textSecondary }]}>📍Salatiga, Indonesia</Text>
            </View>
          </View>
          
          <View style={styles.contactButtons}>
            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: colors.primary }]}
              onPress={handleEmailPress}
            >
              <Ionicons name="mail" size={20} color="white" />
              <Text style={styles.contactButtonText}>Kirim Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: '#0077B5' }]}
              onPress={handleLinkedInPress}
            >
              <Ionicons name="logo-linkedin" size={20} color="white" />
              <Text style={styles.contactButtonText}>LinkedIn</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Message from Developer */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>💬 Pesan dari Developer</Text>
          <View style={[styles.messageContainer, { backgroundColor: colors.background, borderLeftColor: colors.primary }]}>
            <Text style={[styles.messageText, { color: colors.text }]}>
              &ldquo;Terima kasih telah menggunakan aplikasi Catat Uang! 🙏
              {"\n\n"}Aplikasi ini dibuat dengan tujuan membantu Anda mengelola keuangan pribadi dengan lebih baik. Saya berharap aplikasi ini dapat memberikan manfaat dalam perjalanan finansial Anda.
              {"\n\n"}Jika Anda memiliki saran, kritik, atau menemukan bug, jangan ragu untuk menghubungi saya. Feedback Anda sangat berharga untuk pengembangan aplikasi ini ke depannya.
              {"\n\n"}Semoga keuangan Anda selalu sehat dan berkah! 💰✨&rdquo;
            </Text>
            <Text style={[styles.messageSignature, { color: colors.textSecondary }]}>- Tim Developer Catat Uang</Text>
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
  developerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  developerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  developerDetails: {
    flex: 1,
  },
  developerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  developerRole: {
    fontSize: 14,
    marginBottom: 2,
  },
  developerLocation: {
    fontSize: 14,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  messageContainer: {
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  messageSignature: {
    fontSize: 12,
    textAlign: 'right',
    fontWeight: '600',
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