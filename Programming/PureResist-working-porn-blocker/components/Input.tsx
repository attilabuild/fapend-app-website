import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/theme';
import { Caption } from '../components/ui/Typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  value, 
  onChangeText, 
  placeholder,
  secureTextEntry,
  ...rest 
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textTertiary}
        secureTextEntry={secureTextEntry}
        {...rest}
      />
      {error && <Caption color={COLORS.danger} style={styles.errorText}>{error}</Caption>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500' as const,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  input: {
    height: 48,
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.cardLight,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    marginTop: SPACING.xs,
  },
});

export default Input; 