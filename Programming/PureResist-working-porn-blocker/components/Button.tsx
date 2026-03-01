import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  // Button variant styles
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: '#0A1D37', // deep-blue
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: '#4C5B6A', // steel-grey
        };
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: '#39D3B2', // electric-green
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: '#D63A3A', // crimson-red
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: '#0A1D37', // deep-blue
        };
      default:
        return baseStyle;
    }
  };

  // Text variant styles
  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 16,
      fontWeight: '600',
    };

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return {
          ...baseStyle,
          color: '#FFFFFF', // pure-white
        };
      case 'success':
        return {
          ...baseStyle,
          color: '#0A1D37', // deep-blue
        };
      case 'outline':
        return {
          ...baseStyle,
          color: '#0A1D37', // deep-blue
        };
      default:
        return baseStyle;
    }
  };

  const buttonStyle = getButtonStyle();
  const buttonTextStyle = getTextStyle();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        buttonStyle,
        disabled && { opacity: 0.6 },
        style,
      ]}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text style={[buttonTextStyle, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button; 