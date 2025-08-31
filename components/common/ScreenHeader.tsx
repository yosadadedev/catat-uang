import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onMenuPress: () => void;
  rightButton?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
  backgroundColor?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onMenuPress,
  rightButton,
  backgroundColor
}) => {
  const { colors } = useTheme();
  const bgColor = backgroundColor || colors.primary;

  return (
    <View style={{
      backgroundColor: bgColor,
      paddingHorizontal: 16,
      paddingTop: 50,
      paddingBottom: subtitle ? 20 : 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <TouchableOpacity
          onPress={onMenuPress}
          style={{
            padding: 8,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 6,
            marginRight: 12
          }}
        >
          <Ionicons name="menu" size={20} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: 'white'
          }}>
            {title}
          </Text>
          {subtitle && (
            <Text style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 16,
              marginTop: 4
            }}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      
      {rightButton && (
        <View className='flex-row justify-between items-center'>
        <TouchableOpacity
          onPress={rightButton.onPress}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 6,
            padding: 8
          }}
        >
          <Ionicons name={rightButton.icon} size={20} color="white" />
        </TouchableOpacity>
        </View>
      )}
    </View>
  );
};