// Theme constants for the app

export const COLORS = {
  // Base colors
  background: '#000000',
  card: '#121212',
  cardDark: '#0A0A0A',
  cardLight: '#1A1A1A',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textTertiary: '#666666',
  
  // Accent colors
  primary: '#FFFFFF',
  secondary: '#4F3B96',
  accent: '#2979FF', // Changed back to blue from red
  danger: '#ED3237', // Red for panic button
  success: '#00C853', // Green for success indicators
  warning: '#FF9800',
  info: '#2196F3',
  pink: '#FF4081', // For things like success checkmarks in weekly view
  dark: '#121212',
  light: '#F5F5F5',
  
  // Status colorss
  active: '#00C853',
  inactive: '#666666',
  
  // Badge colors
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
};

export const FONTS = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
  },
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    black: '900',
  }
};

// Export FONT_SIZE separately for easier access
export const FONT_SIZE = FONTS.sizes;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
};

const theme = {
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
  SHADOWS,
};

export default theme; 