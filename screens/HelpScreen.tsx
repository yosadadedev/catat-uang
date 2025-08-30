import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { DrawerParamList } from '../navigation/AppNavigator';

type HelpScreenNavigationProp = DrawerNavigationProp<DrawerParamList, 'Help'>;

const { width } = Dimensions.get('window');

interface FeatureItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  steps?: string[];
}

interface HelpSection {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: FeatureItem[];
}

const HelpScreen = () => {
  const navigation = useNavigation<HelpScreenNavigationProp>();
  const [activeSection, setActiveSection] = useState<number>(0);

  const helpSections: HelpSection[] = [
    {
      title: 'Fitur Utama',
      icon: 'star',
      items: [
        {
          icon: 'add-circle',
          title: 'Tambah Transaksi',
          description: 'Catat pemasukan dan pengeluaran dengan mudah',
          steps: [
            'Tekan tombol "+" di pojok kanan bawah',
            'Pilih jenis transaksi (Pemasukan/Pengeluaran)',
            'Masukkan jumlah dan deskripsi',
            'Pilih kategori yang sesuai',
            'Atur tanggal transaksi',
            'Tekan "Simpan Transaksi"'
          ]
        },
        {
          icon: 'list',
          title: 'Lihat Daftar Transaksi',
          description: 'Pantau semua transaksi dengan filter yang fleksibel',
          steps: [
            'Buka menu "Transaksi" dari sidebar',
            'Gunakan tab untuk melihat data harian, mingguan, bulanan, atau tahunan',
            'Filter berdasarkan jenis transaksi (Semua/Pemasukan/Pengeluaran)',
            'Filter berdasarkan kategori tertentu',
            'Urutkan dari terbaru atau terlama',
            'Klik transaksi untuk mengedit'
          ]
        },
        {
          icon: 'pie-chart',
          title: 'Laporan Keuangan',
          description: 'Analisis keuangan dengan grafik dan statistik',
          steps: [
            'Buka menu "Laporan" dari sidebar',
            'Lihat ringkasan saldo, pemasukan, dan pengeluaran',
            'Analisis grafik distribusi pengeluaran',
            'Pantau kategori dengan pengeluaran tertinggi',
            'Gunakan filter periode untuk analisis mendalam'
          ]
        },
        {
          icon: 'grid',
          title: 'Kelola Kategori',
          description: 'Atur kategori sesuai kebutuhan Anda',
          steps: [
            'Buka menu "Kategori" dari sidebar',
            'Tekan "+" untuk menambah kategori baru',
            'Pilih ikon dan warna yang sesuai',
            'Atur jenis kategori (Pemasukan/Pengeluaran)',
            'Edit atau hapus kategori yang tidak diperlukan'
          ]
        }
      ]
    },
    {
      title: 'Tips & Trik',
      icon: 'bulb',
      items: [
        {
          icon: 'time',
          title: 'Catat Transaksi Secara Rutin',
          description: 'Biasakan mencatat setiap transaksi segera setelah terjadi untuk akurasi data yang maksimal'
        },
        {
          icon: 'pie-chart',
          title: 'Manfaatkan Laporan',
          description: 'Gunakan laporan untuk mengidentifikasi pola pengeluaran dan merencanakan anggaran yang lebih baik'
        },
        {
          icon: 'color-palette',
          title: 'Personalisasi Kategori',
          description: 'Buat kategori dengan nama dan ikon yang mudah diingat untuk mempercepat proses pencatatan'
        },
        {
          icon: 'download',
          title: 'Export Data',
          description: 'Gunakan fitur export di halaman transaksi untuk backup data dalam format Excel, PDF, atau CSV'
        }
      ]
    },
    {
      title: 'Pengaturan',
      icon: 'settings',
      items: [
        {
          icon: 'moon',
          title: 'Mode Gelap',
          description: 'Aktifkan mode gelap untuk penggunaan yang lebih nyaman di malam hari',
          steps: [
            'Buka menu "Pengaturan" dari sidebar',
            'Aktifkan toggle "Mode Gelap"',
            'Aplikasi akan otomatis beralih ke tema gelap'
          ]
        },
        {
          icon: 'language',
          title: 'Ubah Bahasa',
          description: 'Pilih bahasa yang diinginkan untuk antarmuka aplikasi',
          steps: [
            'Buka menu "Pengaturan" dari sidebar',
            'Tekan "Bahasa"',
            'Pilih antara Bahasa Indonesia atau English',
            'Aplikasi akan otomatis menerapkan bahasa yang dipilih'
          ]
        },
        {
          icon: 'trash',
          title: 'Reset Data',
          description: 'Hapus semua data untuk memulai dari awal',
          steps: [
            'Buka menu "Pengaturan" dari sidebar',
            'Tekan "Reset Semua Data"',
            'Konfirmasi dengan memasukkan "RESET"',
            'Semua transaksi dan kategori akan dihapus'
          ]
        }
      ]
    },
    {
      title: 'FAQ',
      icon: 'help-circle',
      items: [
        {
          icon: 'cloud-offline',
          title: 'Apakah data tersimpan online?',
          description: 'Tidak, semua data tersimpan secara lokal di perangkat Anda untuk menjaga privasi dan keamanan'
        },
        {
          icon: 'sync',
          title: 'Bagaimana cara backup data?',
          description: 'Gunakan fitur export di halaman transaksi untuk menyimpan data dalam format file yang dapat dibuka di Google Sheets, Microsoft Excel, WPS Office, dan aplikasi spreadsheet lainnya'
        },
        {
          icon: 'phone-portrait',
          title: 'Apakah bisa digunakan offline?',
          description: 'Ya, aplikasi ini dapat digunakan sepenuhnya tanpa koneksi internet'
        },
        {
          icon: 'card',
          title: 'Apakah mendukung multi mata uang?',
          description: 'Saat ini aplikasi menggunakan format Rupiah (IDR). Fitur multi mata uang akan ditambahkan di versi mendatang'
        }
      ]
    }
  ];

  const renderFeatureItem = (item: FeatureItem, index: number) => (
    <View key={index} style={{
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
      }}>
        <View style={{
          backgroundColor: '#3B82F6',
          borderRadius: 8,
          padding: 8,
          marginRight: 12
        }}>
          <Ionicons name={item.icon} size={20} color="white" />
        </View>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#1F2937',
          flex: 1
        }}>
          {item.title}
        </Text>
      </View>
      
      <Text style={{
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: item.steps ? 12 : 0
      }}>
        {item.description}
      </Text>
      
      {item.steps && (
        <View>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 8
          }}>
            Langkah-langkah:
          </Text>
          {item.steps.map((step, stepIndex) => (
            <View key={stepIndex} style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginBottom: 4
            }}>
              <View style={{
                backgroundColor: '#3B82F6',
                borderRadius: 10,
                width: 20,
                height: 20,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
                marginTop: 2
              }}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {stepIndex + 1}
                </Text>
              </View>
              <Text style={{
                fontSize: 13,
                color: '#4B5563',
                flex: 1,
                lineHeight: 18
              }}>
                {step}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#3B82F6', paddingTop: 24 }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#3B82F6',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16
        }}>
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{
              padding: 8,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 6,
              marginRight: 12
            }}
          >
            <Ionicons name="menu" size={20} color="white" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: 'white',
            flex: 1
          }}>
            Bantuan & Tutorial
          </Text>
        </View>
        
        {/* Section Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 8 }}
        >
          {helpSections.map((section, index) => (
            <TouchableOpacity
              key={index}
              style={{
                backgroundColor: activeSection === index ? 'white' : 'rgba(255,255,255,0.2)',
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 8,
                flexDirection: 'row',
                alignItems: 'center'
              }}
              onPress={() => setActiveSection(index)}
            >
              <Ionicons 
                name={section.icon} 
                size={16} 
                color={activeSection === index ? '#3B82F6' : 'white'} 
                style={{ marginRight: 6 }}
              />
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: activeSection === index ? '#3B82F6' : 'white'
              }}>
                {section.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {helpSections[activeSection].items.map((item, index) => 
            renderFeatureItem(item, index)
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HelpScreen;