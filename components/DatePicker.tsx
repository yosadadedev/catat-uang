import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
}

const formatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Hari ini';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Kemarin';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Besok';
  } else {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  }
};

export const DatePicker: React.FC<DatePickerProps> = ({
  date,
  onDateChange,
  placeholder = 'Pilih tanggal',
  disabled = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      onDateChange(selectedDate);
      if (Platform.OS === 'ios') {
        setShowPicker(false);
      }
    }
  };

  const openPicker = () => {
    if (disabled) return;
    setShowPicker(true);
  };

  const getQuickDateOptions = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

    return [
      { label: 'Hari ini', date: today },
      { label: 'Kemarin', date: yesterday },
      { label: 'Lusa', date: dayBeforeYesterday },
    ];
  };

  return (
    <>
      {/* Date Selector Button */}
      <TouchableOpacity
        onPress={openPicker}
        disabled={disabled}
        className={`bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row items-center justify-between ${
          disabled ? 'opacity-50' : ''
        }`}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
            <Ionicons name="calendar" size={20} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 font-medium text-base">
              {formatDate(date)}
            </Text>
            <Text className="text-gray-500 text-sm">
              {date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>
        {!disabled && (
          <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
        )}
      </TouchableOpacity>

      {/* Date Picker - Direct display for both platforms */}
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </>
  );
};

// Date Range Picker Component
interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <View className="space-y-4">
      <View>
        <Text className="text-gray-700 font-medium mb-2">Tanggal Mulai</Text>
        <DatePicker
          date={startDate}
          onDateChange={onStartDateChange}
          placeholder="Pilih tanggal mulai"
        />
      </View>
      
      <View>
        <Text className="text-gray-700 font-medium mb-2">Tanggal Akhir</Text>
        <DatePicker
          date={endDate}
          onDateChange={onEndDateChange}
          placeholder="Pilih tanggal akhir"
        />
      </View>
    </View>
  );
};