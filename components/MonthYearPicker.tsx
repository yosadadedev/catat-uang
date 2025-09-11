import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface MonthYearPickerProps {
  visible: boolean;
  selectedMonth: number;
  selectedYear: number;
  onMonthYearChange: (month: number, year: number) => void;
  onClose: () => void;
}

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  visible,
  selectedMonth,
  selectedYear,
  onMonthYearChange,
  onClose,
}) => {
  const { colors } = useTheme();
  const [tempMonth, setTempMonth] = useState(selectedMonth);
  const [tempYear, setTempYear] = useState(selectedYear);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const handleApply = () => {
    onMonthYearChange(tempMonth, tempYear);
    onClose();
  };

  const handleCancel = () => {
    setTempMonth(selectedMonth);
    setTempYear(selectedYear);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB'
        }}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={{ fontSize: 16, color: '#6B7280' }}>Batal</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
            Pilih Bulan & Tahun
          </Text>
          <TouchableOpacity onPress={handleApply}>
            <Text style={{ fontSize: 16, color: '#3B82F6', fontWeight: '600' }}>Terapkan</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {/* Year Selection */}
          <View style={{ padding: 16 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 12
            }}>
              Tahun
            </Text>
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8
            }}>
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  onPress={() => setTempYear(year)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: tempYear === year ? '#3B82F6' : '#F3F4F6',
                    minWidth: 80,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: tempYear === year ? 'white' : colors.text
                  }}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Month Selection */}
          <View style={{ padding: 16 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 12
            }}>
              Bulan
            </Text>
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8
            }}>
              {monthNames.map((month, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setTempMonth(index)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: tempMonth === index ? '#3B82F6' : '#F3F4F6',
                    minWidth: 100,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: tempMonth === index ? 'white' : colors.text
                  }}>
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};