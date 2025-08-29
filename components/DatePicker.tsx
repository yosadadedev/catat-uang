import React from 'react';
import {
  View,
  Text,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

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


  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      onDateChange(selectedDate);
    }
  };

  return (
    <>
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />

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