import { View, type ViewProps } from 'react-native';

interface InnerCardProps extends ViewProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'lg' | 'xl' | '2xl';
}

const paddingClasses = {
  none: '',
  sm: 'p-2.5',
  md: 'p-3',
  lg: 'p-4',
};

const roundedClasses = {
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

export function InnerCard({
  padding = 'md',
  rounded = 'xl',
  className = '',
  children,
  ...rest
}: InnerCardProps) {
  return (
    <View
      {...rest}
      className={`bg-surface ${roundedClasses[rounded]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </View>
  );
}
