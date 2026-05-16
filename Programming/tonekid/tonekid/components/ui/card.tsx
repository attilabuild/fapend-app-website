import { View, type ViewProps } from 'react-native';

import { shadow } from '@/constants/tokens';

interface CardProps extends ViewProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: '2xl' | '3xl';
  variant?: 'white' | 'surface';
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export function Card({
  padding = 'lg',
  rounded = '2xl',
  variant = 'white',
  className = '',
  style,
  children,
  ...rest
}: CardProps) {
  const bg = variant === 'white' ? 'bg-white' : 'bg-surface';
  const r = rounded === '3xl' ? 'rounded-3xl' : 'rounded-2xl';
  return (
    <View
      {...rest}
      style={[variant === 'white' ? shadow.card : undefined, style]}
      className={`${bg} ${r} ${paddingClasses[padding]} ${className}`}>
      {children}
    </View>
  );
}
