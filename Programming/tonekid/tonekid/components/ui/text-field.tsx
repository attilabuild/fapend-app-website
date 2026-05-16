import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { colors } from '@/constants/tokens';

interface TextFieldProps extends Omit<TextInputProps, 'className' | 'style'> {
  className?: string;
}

export function TextField({ className = '', onFocus, onBlur, ...rest }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View
      className={`rounded-2xl ${focused ? 'bg-surface-elevated' : 'bg-surface'} px-4 py-3 ${className}`}>
      <TextInput
        {...rest}
        placeholderTextColor={colors.inkMuted}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className="text-ink text-base"
        style={{ paddingVertical: 0, minHeight: 24 }}
      />
    </View>
  );
}
