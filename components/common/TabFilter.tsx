import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface TabOption {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
}

interface TabFilterProps {
  options: TabOption[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  style?: any;
}

export const TabFilter: React.FC<TabFilterProps> = ({
  options,
  activeTab,
  onTabChange,
  style
}) => {
  const { colors } = useTheme();

  return (
    <View style={[
      {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      style
    ]}>
      {options.map((option) => {
        const isActive = activeTab === option.key;
        const backgroundColor = isActive 
          ? (option.color || colors.primary)
          : 'transparent';
        const textColor = isActive 
          ? 'white' 
          : colors.textSecondary;

        return (
          <TouchableOpacity
            key={option.key}
            onPress={() => onTabChange(option.key)}
            style={{
              flex: 1,
              backgroundColor,
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {option.icon && (
              <Ionicons 
                name={option.icon} 
                size={16} 
                color={textColor} 
                style={{ marginRight: 6 }}
              />
            )}
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: textColor
            }}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};