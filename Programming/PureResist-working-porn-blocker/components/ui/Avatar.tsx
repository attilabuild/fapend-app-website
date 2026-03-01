import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../../utils/theme';

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  imageUrl?: string;
  initials?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  imageStyle?: ImageStyle;
}

const Avatar: React.FC<AvatarProps> = ({
  size = 'md',
  imageUrl,
  initials,
  backgroundColor,
  style,
  textStyle,
  imageStyle,
}) => {
  // Calculate avatar dimensions based on size
  const getAvatarSize = (): number => {
    switch (size) {
      case 'sm':
        return 32;
      case 'md':
        return 40;
      case 'lg':
        return 56;
      case 'xl':
        return 80;
      default:
        return 40;
    }
  };

  // Calculate font size based on avatar size
  const getFontSize = (): number => {
    switch (size) {
      case 'sm':
        return FONTS.sizes.sm;
      case 'md':
        return FONTS.sizes.md;
      case 'lg':
        return FONTS.sizes.lg;
      case 'xl':
        return FONTS.sizes.xl;
      default:
        return FONTS.sizes.md;
    }
  };

  // Generate background color if not provided
  const getBackgroundColor = (): string => {
    if (backgroundColor) return backgroundColor;
    
    // If initials provided, use a hash-based color
    if (initials) {
      const charCode = initials.charCodeAt(0) || 65;
      const hue = (charCode * 7) % 360;
      return `hsl(${hue}, 30%, 30%)`; // Darker muted colors that match the dark theme
    }
    
    return COLORS.cardLight;
  };

  const avatarSize = getAvatarSize();
  const fontSize = getFontSize();
  const bgColor = getBackgroundColor();

  return (
    <View
      style={[
        styles.container,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          backgroundColor: bgColor,
        },
        style,
      ]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
            imageStyle,
          ]}
        />
      ) : initials ? (
        <Text
          style={[
            styles.initials,
            {
              fontSize,
            },
            textStyle,
          ]}
        >
          {initials.toUpperCase()}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
});

export default Avatar; 