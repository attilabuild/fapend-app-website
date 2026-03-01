import React, { ReactNode } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  TouchableOpacityProps,
  ActivityIndicator,
  View
} from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  customLeftIcon?: ReactNode;
  customRightIcon?: ReactNode;
  textColor?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  customLeftIcon,
  customRightIcon,
  textColor,
  style,
  ...props
}) => {
  // Determine button colors based on variant
  const getButtonColors = () => {
    switch (variant) {
      case 'primary':
        return {
          background: COLORS.accent,
          text: COLORS.textPrimary,
        };
      case 'secondary':
        return {
          background: COLORS.card,
          text: COLORS.textPrimary,
        };
      case 'danger':
        return {
          background: COLORS.danger,
          text: COLORS.textPrimary,
        };
      case 'outline':
        return {
          background: 'transparent',
          text: COLORS.textPrimary,
          borderColor: COLORS.textSecondary,
          borderWidth: 1,
        };
      case 'ghost':
        return {
          background: 'transparent',
          text: COLORS.textPrimary,
        };
      default:
        return {
          background: COLORS.accent,
          text: COLORS.textPrimary,
        };
    }
  };

  // Determine button padding based on size
  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: SPACING.xs,
          paddingHorizontal: SPACING.md,
          fontSize: FONTS.sizes.sm,
        };
      case 'lg':
        return {
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.xl,
          fontSize: FONTS.sizes.lg,
        };
      default:
        return {
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.lg,
          fontSize: FONTS.sizes.md,
        };
    }
  };

  const buttonColors = getButtonColors();
  const buttonSize = getButtonSize();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: buttonColors.background,
          paddingVertical: buttonSize.paddingVertical,
          paddingHorizontal: buttonSize.paddingHorizontal,
          borderColor: buttonColors.borderColor,
          borderWidth: buttonColors.borderWidth,
          opacity: isDisabled ? 0.6 : 1,
          width: fullWidth ? '100%' : 'auto',
        },
        style,
      ]}
      disabled={isDisabled}
      {...props}
    >
      <View style={styles.content}>
        {customLeftIcon && !loading && (
          <View style={styles.leftIcon}>
            {customLeftIcon}
          </View>
        )}
        {leftIcon && !loading && !customLeftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={buttonSize.fontSize + 2} 
            color={textColor || buttonColors.text} 
            style={styles.leftIcon} 
          />
        )}
        
        {loading ? (
          <ActivityIndicator size="small" color={textColor || buttonColors.text} />
        ) : (
          <Text
            style={[
              styles.text,
              {
                color: textColor || buttonColors.text,
                fontSize: buttonSize.fontSize,
              },
            ]}
          >
            {title}
          </Text>
        )}
        
        {customRightIcon && !loading && (
          <View style={styles.rightIcon}>
            {customRightIcon}
          </View>
        )}
        {rightIcon && !loading && !customRightIcon && (
          <Ionicons 
            name={rightIcon} 
            size={buttonSize.fontSize + 2} 
            color={textColor || buttonColors.text} 
            style={styles.rightIcon} 
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const PanicButton: React.FC<Omit<ButtonProps, 'title' | 'variant'>> = (props) => {
  // Get the navigation
  const navigation = useNavigation();

  // Handle panic button press
  const handlePanicPress = () => {
    if (navigation) {
      navigation.navigate('PanicScreen');
    }
  };

  return (
    <Button
      title="Panic Button"
      variant="danger"
      leftIcon="alert-circle"
      size="lg"
      fullWidth
      onPress={handlePanicPress}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: SPACING.xs,
  },
  rightIcon: {
    marginLeft: SPACING.xs,
  },
});

export { Button, PanicButton }; 