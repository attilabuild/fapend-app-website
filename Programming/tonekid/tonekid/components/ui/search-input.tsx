import { useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { Search, X } from 'lucide-react-native';

import { colors } from '@/constants/tokens';

interface SearchInputProps extends Omit<TextInputProps, 'style' | 'className'> {
  className?: string;
}

export function SearchInput({
  className = '',
  onFocus,
  onBlur,
  onChangeText,
  value,
  ...rest
}: SearchInputProps) {
  const [focused, setFocused] = useState(false);
  const showClear = Boolean(value && value.length > 0);
  return (
    <View
      className={`flex-row items-center rounded-2xl ${focused ? 'bg-surface-elevated' : 'bg-surface'} px-4 py-3 ${className}`}>
      <Search size={18} color={colors.inkMuted} />
      <TextInput
        {...rest}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.inkMuted}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className="ml-2.5 flex-1 text-base text-ink"
        style={{ paddingVertical: 0 }}
      />
      {showClear ? (
        <Pressable
          onPress={() => onChangeText?.('')}
          hitSlop={12}
          className="ml-2 h-5 w-5 items-center justify-center rounded-full bg-ink/10">
          <X size={12} color={colors.ink} strokeWidth={3} />
        </Pressable>
      ) : null}
    </View>
  );
}
