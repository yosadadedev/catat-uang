import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
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
  const [showModal, setShowModal] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      onDateChange(selectedDate);
      if (Platform.OS === 'ios') {
        setShowModal(false);
      }
    }
  };

  const openPicker = () => {
    if (disabled) return;
    
    if (Platform.OS === 'ios') {
      setShowModal(true);
    } else {
      setShowPicker(true);
    }
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

      {/* Android Date Picker */}
      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* iOS Date Picker Modal */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowModal(false)}
        >
          <View className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text className="text-blue-600 font-medium text-lg">Batal</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-900">Pilih Tanggal</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text className="text-blue-600 font-medium text-lg">Selesai</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Date Options */}
            <View className="p-4">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Pilihan Cepat
              </Text>
              <View className="flex-row justify-between mb-4">
                {getQuickDateOptions().map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      onDateChange(option.date);
                      setShowModal(false);
                    }}
                    className={`flex-1 mx-1 p-3 rounded-xl border-2 ${
                      date.toDateString() === option.date.toDateString()
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Text
                      className={`text-center font-medium ${
                        date.toDateString() === option.date.toDateString()
                          ? 'text-blue-700'
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                    <Text
                      className={`text-center text-sm mt-1 ${
                        date.toDateString() === option.date.toDateString()
                          ? 'text-blue-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {option.date.toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Picker */}
            <View className="flex-1 justify-center">
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                style={{ backgroundColor: 'white' }}
              />
            </View>

            {/* Bottom Safe Area */}
            <View className="h-8" />
          </View>
        </Modal>
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