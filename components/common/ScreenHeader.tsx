import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface RightButtonConfig {
  icon?: keyof typeof Ionicons.glyphMap;
  text?: string;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
  backgroundColor?: string;
  size?: number;
}

interface DateNavigationConfig {
  currentDate: string;
  onPrevious: () => void;
  onNext: () => void;
  onDatePress: () => void;
}

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onMenuPress: () => void;
  rightButton?: RightButtonConfig | RightButtonConfig[];
  backgroundColor?: string;
  dateNavigation?: DateNavigationConfig;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onMenuPress,
  rightButton,
  backgroundColor,
  dateNavigation
}) => {
  const { colors } = useTheme();
  const bgColor = backgroundColor || colors.primary;

  return (
    <View style={{
      backgroundColor: bgColor,
      paddingHorizontal: 16,
      paddingTop: 50,
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: dateNavigation ? 20 : (subtitle ? 20 : 16)
    }}>
      {/* Header Row */}
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
      <View className='flex-row items-center'>
                {rightButton && (
          <View className='flex-row items-center gap-2'>
            {Array.isArray(rightButton) ? (
              rightButton.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={button.onPress}
                  disabled={button.disabled}
                  style={{
                    backgroundColor: button.backgroundColor || 'rgba(255,255,255,0.2)',
                    borderRadius: 6,
                    padding: 8,
                    opacity: button.disabled ? 0.5 : 1
                  }}
                >
                  {button.text ? (
                    <Text style={{
                      fontSize: button.size || 12,
                      fontWeight: 'bold',
                      color: button.color || 'white',
                      textAlign: 'center'
                    }}>
                      {button.text}
                    </Text>
                  ) : (
                    <Ionicons 
                      name={button.icon!} 
                      size={button.size || 20} 
                      color={button.color || "white"} 
                    />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                onPress={rightButton.onPress}
                disabled={rightButton.disabled}
                style={{
                  backgroundColor: rightButton.backgroundColor || 'rgba(255,255,255,0.2)',
                  borderRadius: 6,
                  padding: 8,
                  opacity: rightButton.disabled ? 0.5 : 1
                }}
              >
                {rightButton.text ? (
                  <Text style={{
                    fontSize: rightButton.size || 12,
                    fontWeight: 'bold',
                    color: rightButton.color || 'white',
                    textAlign: 'center'
                  }}>
                    {rightButton.text}
                  </Text>
                ) : (
                  <Ionicons 
                    name={rightButton.icon!} 
                    size={rightButton.size || 20} 
                    color={rightButton.color || "white"} 
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
              {/* Date Navigation Row */}
      {dateNavigation && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: 8,
            paddingVertical: 4 ,
            marginLeft: 6,
            justifyContent: 'space-between'
          }}>
            <TouchableOpacity
              onPress={dateNavigation.onPrevious}
              style={{ 
                padding: 6,
              }}
            >
              <Ionicons name="chevron-back" size={18} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={dateNavigation.onDatePress}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{
                fontSize: 10,
                fontWeight: '600',
                color: 'white',
                textAlign: 'center'
              }}>
                {dateNavigation.currentDate}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={dateNavigation.onNext}
              style={{ 
                padding: 6,
              }}
            >
              <Ionicons name="chevron-forward" size={18} color="white" />
            </TouchableOpacity>
          </View>
      )}
      </View>

    </View>
  );
};