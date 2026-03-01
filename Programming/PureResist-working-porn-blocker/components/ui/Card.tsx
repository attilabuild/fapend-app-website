import React from 'react';
import { View, StyleSheet, ViewProps, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

export interface CardProps extends ViewProps {
  variant?: 'default' | 'dark' | 'light';
  noPadding?: boolean;
  onPress?: TouchableOpacityProps['onPress'];
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  noPadding = false,
  onPress,
  ...props
}) => {
  const backgroundColor = 
    variant === 'dark' 
      ? COLORS.cardDark 
      : variant === 'light' 
        ? COLORS.cardLight 
        : COLORS.card;

  // If onPress is provided, wrap in TouchableOpacity, otherwise use View
  const Container = onPress ? TouchableOpacity : View;
  const containerProps = onPress ? { ...props, onPress } : props;

  return (
    <Container
      style={[
        styles.card,
        { backgroundColor },
        noPadding ? null : styles.padding,
        style,
      ]}
      activeOpacity={0.7}
      {...containerProps}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  padding: {
    padding: SPACING.md,
  },
});

export default Card; 