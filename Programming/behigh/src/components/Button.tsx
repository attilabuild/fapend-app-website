import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
}) => {
  const baseClasses = 'py-4 px-6 rounded-xl items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-black',
    secondary: 'bg-white border border-gray-300',
    outline: 'bg-transparent border-2 border-black',
  };
  
  const textClasses = {
    primary: 'text-white',
    secondary: 'text-black',
    outline: 'text-black',
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50' : ''} ${className}`}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : 'black'} />
      ) : (
        <Text className={`${textClasses[variant]} font-bold text-base`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

