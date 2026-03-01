import React from 'react';
import { Text, StyleSheet, TextProps, TextStyle } from 'react-native';
import { COLORS, FONTS } from '../../utils/theme';

interface TypographyProps extends TextProps {
  children: React.ReactNode;
  color?: string;
  center?: boolean;
  bold?: boolean;
  semiBold?: boolean;
  light?: boolean;
}

export const Title: React.FC<TypographyProps> = ({
  children,
  style,
  color = COLORS.textPrimary,
  center = false,
  bold = false,
  semiBold = false,
  light = false,
  ...props
}) => {
  return (
    <Text
      style={[
        styles.title,
        { color },
        center && styles.center,
        bold && styles.bold,
        semiBold && styles.semiBold,
        light && styles.light,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export const Subtitle: React.FC<TypographyProps> = ({
  children,
  style,
  color = COLORS.textSecondary,
  center = false,
  bold = false,
  semiBold = false,
  light = false,
  ...props
}) => {
  return (
    <Text
      style={[
        styles.subtitle,
        { color },
        center && styles.center,
        bold && styles.bold,
        semiBold && styles.semiBold,
        light && styles.light,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export const Body: React.FC<TypographyProps> = ({
  children,
  style,
  color = COLORS.textPrimary,
  center = false,
  bold = false,
  semiBold = false,
  light = false,
  ...props
}) => {
  return (
    <Text
      style={[
        styles.body,
        { color },
        center && styles.center,
        bold && styles.bold,
        semiBold && styles.semiBold,
        light && styles.light,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export const Caption: React.FC<TypographyProps> = ({
  children,
  style,
  color = COLORS.textSecondary,
  center = false,
  bold = false,
  semiBold = false,
  light = false,
  ...props
}) => {
  return (
    <Text
      style={[
        styles.caption,
        { color },
        center && styles.center,
        bold && styles.bold,
        semiBold && styles.semiBold,
        light && styles.light,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

// Font weight constants to avoid type errors
const FONT_WEIGHTS = {
  bold: '700' as TextStyle['fontWeight'],
  semiBold: '600' as TextStyle['fontWeight'],
  regular: '400' as TextStyle['fontWeight'],
  light: '300' as TextStyle['fontWeight']
};

const styles = StyleSheet.create({
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  subtitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONT_WEIGHTS.regular,
  },
  body: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONT_WEIGHTS.regular,
  },
  caption: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONT_WEIGHTS.regular,
  },
  center: {
    textAlign: 'center',
  },
  bold: {
    fontWeight: FONT_WEIGHTS.bold,
  },
  semiBold: {
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  light: {
    fontWeight: FONT_WEIGHTS.light,
  },
}); 