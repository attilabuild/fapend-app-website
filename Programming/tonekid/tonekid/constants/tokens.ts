export const colors = {
  bg: '#FFFFFF',
  surface: '#F4F4F5',
  surfaceElevated: '#EEEEF0',
  hairline: '#E5E5E7',
  ink: '#0A0A0A',
  inkPressed: '#1A1A1A',
  inkSecondary: '#6B7280',
  inkMuted: '#9CA3AF',
  success: '#10B981',
  successBg: '#D1FAE5',
  successInk: '#059669',
  warning: '#F59E0B',
  warningBg: '#FDE68A',
  danger: '#EF4444',
  dangerBg: '#FEE2E2',
  accentPurple: '#7C3AED',
  accentPurpleBg: '#EDE9FE',
  accentPink: '#DB2777',
  accentPinkBg: '#FCE7F3',
  accentBlue: '#2563EB',
  accentBlueBg: '#DBEAFE',
  accentTeal: '#0D9488',
  accentTealBg: '#CCFBF1',
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  float: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
