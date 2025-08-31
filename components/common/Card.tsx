import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  margin?: number;
  borderRadius?: number;
  backgroundColor?: string;
  shadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 20,
  margin = 16,
  borderRadius = 12,
  backgroundColor,
  shadow = true
}) => {
  const { colors } = useTheme();
  const bgColor = backgroundColor || colors.surface;

  const shadowStyle = shadow ? {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  } : {};

  return (
    <View style={[
      {
        backgroundColor: bgColor,
        borderRadius,
        padding,
        marginBottom: margin,
        ...shadowStyle
      },
      style
    ]}>
      {children}
    </View>
  );
};