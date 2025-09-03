import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

// Simple DatePicker component for basic date selection
interface DatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  date,
  onDateChange,
}) => {
  return (
    <TouchableOpacity
      style={{
        padding: 12,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        backgroundColor: 'white'
      }}
      onPress={() => {
        // This is a simplified version - in a real app you might want to show a modal with date picker
        console.log('Date picker pressed');
      }}
    >
      <Text style={{ color: '#374151' }}>
        {date.toLocaleDateString('id-ID')}
      </Text>
    </TouchableOpacity>
  );
};

// Date Range Picker Component
interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onClose?: () => void;
  onApply?: () => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClose,
  onApply,
}) => {
  const { colors } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Adjust for Monday start

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const isDateSelected = (date: Date) => {
    if (!date) return false;
    return (
      date.toDateString() === startDate.toDateString() ||
      date.toDateString() === endDate.toDateString()
    );
  };

  const handleDatePress = (date: Date) => {
    if (selectingStart) {
      onStartDateChange(date);
      if (date > endDate) {
        onEndDateChange(date);
      }
      setSelectingStart(false);
    } else {
      if (date < startDate) {
        onStartDateChange(date);
      } else {
        onEndDateChange(date);
      }
      setSelectingStart(true);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <View style={{ backgroundColor: colors.surface, flex: 1 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <TouchableOpacity onPress={onClose} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>Pilih Tanggal</Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Month Navigation */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
          <TouchableOpacity onPress={() => navigateMonth('prev')}>
            <Ionicons name="chevron-back" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth('next')}>
            <Ionicons name="chevron-forward" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Day Headers */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8 }}>
          {dayNames.map((day, index) => (
            <View key={index} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary }}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={{ paddingHorizontal: 16 }}>
          {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
            <View key={weekIndex} style={{ flexDirection: 'row', marginBottom: 4 }}>
              {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => {
                const isSelected = date && isDateSelected(date);
                const isInRange = date && isDateInRange(date);
                const isToday = date && date.toDateString() === new Date().toDateString();
                
                return (
                  <View key={dayIndex} style={{ flex: 1, aspectRatio: 1, padding: 2 }}>
                    {date ? (
                      <TouchableOpacity
                        onPress={() => handleDatePress(date)}
                        style={[
                          {
                            width: '100%',
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 8,
                          },
                          isSelected && { backgroundColor: colors.primary },
                          isInRange && !isSelected && { backgroundColor: colors.primary + '20' },
                          isToday && !isSelected && !isInRange && { borderWidth: 1, borderColor: colors.primary }
                        ]}
                      >
                        <Text
                          style={[
                            { fontSize: 16, fontWeight: '500' },
                            isSelected ? { color: 'white' } : { color: colors.text },
                            isInRange && !isSelected && { color: colors.primary }
                          ]}
                        >
                          {date.getDate()}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={{ width: '100%', height: '100%' }} />
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Show next month if needed */}
        {(() => {
          const nextMonth = new Date(currentMonth);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          const nextMonthDays = getDaysInMonth(nextMonth);
          
          return (
            <View style={{ marginTop: 24 }}>
              {/* Next Month Header */}
              <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  {monthNames[nextMonth.getMonth()]} {nextMonth.getFullYear()}
                </Text>
              </View>

              {/* Day Headers */}
              <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8 }}>
                {dayNames.map((day, index) => (
                  <View key={index} style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary }}>{day}</Text>
                  </View>
                ))}
              </View>

              {/* Next Month Calendar Grid */}
              <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
                {Array.from({ length: Math.ceil(nextMonthDays.length / 7) }, (_, weekIndex) => (
                  <View key={weekIndex} style={{ flexDirection: 'row', marginBottom: 4 }}>
                    {nextMonthDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => {
                      const isSelected = date && isDateSelected(date);
                      const isInRange = date && isDateInRange(date);
                      const isToday = date && date.toDateString() === new Date().toDateString();
                      
                      return (
                        <View key={dayIndex} style={{ flex: 1, aspectRatio: 1, padding: 2 }}>
                          {date ? (
                            <TouchableOpacity
                              onPress={() => handleDatePress(date)}
                              style={[
                                {
                                  width: '100%',
                                  height: '100%',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  borderRadius: 8,
                                },
                                isSelected && { backgroundColor: colors.primary },
                                isInRange && !isSelected && { backgroundColor: colors.primary + '20' },
                                isToday && !isSelected && !isInRange && { borderWidth: 1, borderColor: colors.primary }
                              ]}
                            >
                              <Text
                                style={[
                                  { fontSize: 16, fontWeight: '500' },
                                  isSelected ? { color: 'white' } : { color: colors.text },
                                  isInRange && !isSelected && { color: colors.primary }
                                ]}
                              >
                                {date.getDate()}
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <View style={{ flex: 1 }} />
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          );
        })()}
      </ScrollView>

      {/* Bottom Section */}
      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
        {/* Apply Button */}
        <TouchableOpacity
          onPress={() => {
            onApply?.();
            onClose?.();
          }}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 16
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Terapkan</Text>
        </TouchableOpacity>

        {/* Date Range Display */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Tanggal Awal</Text>
            <Text style={{ fontSize: 14, color: colors.text, fontWeight: '500' }}>
              {formatDate(startDate)}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Tanggal Akhir</Text>
            <Text style={{ fontSize: 14, color: colors.text, fontWeight: '500' }}>
              {formatDate(endDate)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};