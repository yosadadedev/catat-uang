# Catat Uang – Aplikasi Mobile untuk Manajemen Keuangan Personal

**Capstone Project**  
Universitas Terbuka – 7 September 2025

## Problem Statement

- **Kesulitan mengelola keuangan personal** di Indonesia sangat tinggi
- **70% masyarakat** tidak memiliki catatan keuangan yang teratur
- **Dampak**: pengeluaran tidak terkontrol, sulit mencapai tujuan finansial
- **Target**: individu, mahasiswa, pekerja, dan keluarga

## Solution Overview

- **Platform mobile** untuk pencatatan dan analisis keuangan personal
- **Value proposition**: mudah digunakan, analisis mendalam, gratis, offline-capable
- **Target user**: mahasiswa, pekerja muda, keluarga dengan kebutuhan manajemen keuangan

## Key Features (Implemented)

✅ **Pencatatan Transaksi** (pemasukan & pengeluaran)  
✅ **Kategori Kustom** (dapat disesuaikan)  
✅ **Filter & Pencarian** (berdasarkan tanggal, kategori, jenis)  
✅ **Laporan Keuangan** (grafik dan statistik)  
✅ **Export Data** (Excel, PDF)  
✅ **Swipe to Delete** (gesture intuitif)  
✅ **Responsive UI** (iOS & Android)  

## Technical Architecture

- **Frontend**: React Native + Expo
- **Database**: SQLite (local storage)
- **State Management**: Zustand
- **Styling**: NativeWind (Tailwind CSS)
- **Navigation**: React Navigation
- **Charts**: Victory Native
- **Export**: XLSX, Expo Print

## User Journey

```
Onboarding → List Transaksi → Tambah Transaksi → Lihat Laporan → Filter Data → Export Laporan
```

## App Screenshots

- **Home**: Dashboard dengan ringkasan keuangan
- **Transactions**: Daftar transaksi dengan filter
- **Reports**: Grafik dan analisis keuangan
- **Categories**: Manajemen kategori kustom
- **Settings**: Pengaturan aplikasi

## Technical Implementation

### Database Setup
- SQLite untuk penyimpanan lokal
- Schema: transactions, categories, settings
- CRUD operations dengan TypeScript

### Cross-platform Development
- React Native + Expo untuk iOS & Android
- NativeWind untuk styling konsisten
- Responsive design untuk berbagai ukuran layar

### State Management
- Zustand untuk global state
- Persistent storage untuk data offline
- Optimistic updates untuk UX yang smooth

## Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| **Cross-platform compatibility** | React Native + Expo |
| **Data persistence** | SQLite dengan Expo SQLite |
| **State management** | Zustand dengan persistence |
| **UI consistency** | NativeWind + design system |
| **Performance** | Optimized queries & lazy loading |

## Current Status & Achievements

### ✅ Completed
- Core transaction management
- Category management system
- Financial reports with charts
- Data export functionality
- Swipe gestures for better UX
- Responsive UI design

### 🚧 In Progress
- Advanced filtering options
- Budget tracking features
- Data backup & restore

### 📋 Planned
- Cloud synchronization
- Multi-currency support
- Recurring transactions
- Financial goals tracking
- AI-powered insights

## Future Enhancements
- **Google Drive Backup**: Backup data ke Google Drive untuk keamanan ekstra
- **UI/UX Improvements**: Peningkatan antarmuka pengguna yang lebih modern dan intuitif


## Demo

🚀 **Live Demo**: [Download APK](https://expo.dev/accounts/yosadadev/projects/catat-uang/builds/c2697af4-fe7c-4a54-bdb0-eba41087aa6a)  
📱 **QR Code**: Scan QR code di link APK untuk install aplikasi  
🎥 **Video Demo**: [Lihat Demo di YouTube](https://youtube.com/shorts/-jJyWbXOiVo?si=cuXDyss0GrksuCJT)

### Cara Install Aplikasi:
1. Buka link APK di atas
2. Scan QR code dengan kamera HP atau
3. Download dan install aplikasi
4. Mulai gunakan Catat Uang!

## Lessons Learned

### Technical Skills
- **React Native**: Cross-platform mobile development
- **SQLite**: Local database management
- **State Management**: Zustand implementation
- **UI/UX**: Mobile-first design principles

### Project Management
- **Agile Development**: Sprint planning & execution
- **Version Control**: Git workflow & collaboration
- **Testing**: Unit testing & device testing
- **Documentation**: Technical & user documentation

### Problem Solving
- **Performance Optimization**: Query optimization
- **User Experience**: Intuitive gesture implementation
- **Data Management**: Efficient storage strategies
- **Cross-platform Issues**: Platform-specific solutions

## Development Roadmap

### Phase 1: Core Features (✅ Completed)
- Basic transaction management
- Category system
- Simple reports

### Phase 2: Enhanced Features (🚧 Current)
- Advanced filtering
- Better analytics
- Export improvements

### Phase 3: Advanced Features (📋 Planned)
- Cloud sync
- AI insights
- Multi-currency
- Budget tracking

## Contributing

Kontribusi sangat diterima! Silakan buat issue atau pull request.

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact & Support

📧 **Email**: masyosad@gmail.com  
💼 **LinkedIn**: [linkedin.com/in/yosadade](https://linkedin.com/in/yosadade)  
🐙 **GitHub**: [github.com/yosadadedev/catat-uang](https://github.com/yosadadedev/catat-uang)  
📱 **APK Download**: [Expo Build](https://expo.dev/accounts/yosadadev/projects/catat-uang/builds/c2697af4-fe7c-4a54-bdb0-eba41087aa6a)  
🎥 **Demo Video**: [YouTube Demo](https://youtube.com/shorts/-jJyWbXOiVo?si=cuXDyss0GrksuCJT)  

---

**Terima kasih telah menggunakan Catat Uang! 🙏**

*Aplikasi ini dibuat dengan ❤️ untuk membantu mengelola keuangan personal dengan lebih baik.*