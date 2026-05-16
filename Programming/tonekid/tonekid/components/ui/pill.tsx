import { Pressable, Text, View, type PressableProps } from 'react-native';
import { type ReactNode } from 'react';

export type PillVariant =
  | 'filled'
  | 'outline'
  | 'selected'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'purple'
  | 'pink'
  | 'blue'
  | 'green'
  | 'teal'
  | 'gray';

interface PillProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: PillVariant;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md';
}

const variantClasses: Record<PillVariant, { bg: string; text: string; border?: string }> = {
  filled: { bg: 'bg-surface', text: 'text-ink' },
  outline: { bg: 'bg-transparent', text: 'text-ink', border: 'border border-hairline' },
  selected: { bg: 'bg-ink', text: 'text-white' },
  success: { bg: 'bg-success-bg', text: 'text-success-ink' },
  warning: { bg: 'bg-warning-bg', text: 'text-warning' },
  error: { bg: 'bg-danger-bg', text: 'text-danger' },
  info: { bg: 'bg-accent-blue-bg', text: 'text-accent-blue' },
  purple: { bg: 'bg-accent-purple-bg', text: 'text-accent-purple' },
  pink: { bg: 'bg-accent-pink-bg', text: 'text-accent-pink' },
  blue: { bg: 'bg-accent-blue-bg', text: 'text-accent-blue' },
  green: { bg: 'bg-success-bg', text: 'text-success-ink' },
  teal: { bg: 'bg-accent-teal-bg', text: 'text-accent-teal' },
  gray: { bg: 'bg-surface', text: 'text-ink-secondary' },
};

export function Pill({
  label,
  variant = 'filled',
  leftIcon,
  rightIcon,
  size = 'md',
  onPress,
  ...rest
}: PillProps) {
  const v = variantClasses[variant];
  const sizeCls = size === 'sm' ? 'py-1 px-2.5' : 'py-2 px-3';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const content = (
    <View
      className={`flex-row items-center rounded-full ${v.bg} ${v.border ?? ''} ${sizeCls}`}>
      {leftIcon ? <View className="mr-1.5">{leftIcon}</View> : null}
      <Text className={`${v.text} ${textSize} font-semibold`}>{label}</Text>
      {rightIcon ? <View className="ml-1.5">{rightIcon}</View> : null}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} {...rest}>
      {content}
    </Pressable>
  );
}
