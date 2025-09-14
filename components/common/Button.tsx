import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { colors } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.6 : 1,
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = 12;
        baseStyle.paddingVertical = 8;
        break;
      case 'large':
        baseStyle.paddingHorizontal = 24;
        baseStyle.paddingVertical = 16;
        break;
      default: // medium
        baseStyle.paddingHorizontal = 16;
        baseStyle.paddingVertical = 12;
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyle.backgroundColor = colors.textSecondary;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.primary;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
      case 'danger':
        baseStyle.backgroundColor = '#EF4444';
        break;
      default: // primary
        baseStyle.backgroundColor = colors.primary;
    }

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: '600',
    };

    // Size text styles
    switch (size) {
      case 'small':
        baseTextStyle.fontSize = 14;
        break;
      case 'large':
        baseTextStyle.fontSize = 18;
        break;
      default: // medium
        baseTextStyle.fontSize = 16;
    }

    // Variant text styles
    switch (variant) {
      case 'outline':
        baseTextStyle.color = colors.primary;
        break;
      case 'ghost':
        baseTextStyle.color = colors.text;
        break;
      default:
        baseTextStyle.color = 'white';
    }

    return baseTextStyle;
  };

  const getIconColor = (): string => {
    switch (variant) {
      case 'outline':
        return colors.primary;
      case 'ghost':
        return colors.text;
      default:
        return 'white';
    }
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 20;
      default:
        return 18;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[getButtonStyle(), style]}>
      {icon && iconPosition === 'left' && (
        <Ionicons
          name={icon}
          size={getIconSize()}
          color={getIconColor()}
          style={{ marginRight: 8 }}
        />
      )}
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      {icon && iconPosition === 'right' && (
        <Ionicons
          name={icon}
          size={getIconSize()}
          color={getIconColor()}
          style={{ marginLeft: 8 }}
        />
      )}
    </TouchableOpacity>
  );
};
