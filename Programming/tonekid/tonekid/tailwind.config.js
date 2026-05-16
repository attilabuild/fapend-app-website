/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#FFFFFF',
        surface: '#F4F4F5',
        'surface-elevated': '#EEEEF0',
        hairline: '#E5E5E7',
        ink: '#0A0A0A',
        'ink-pressed': '#1A1A1A',
        'ink-secondary': '#6B7280',
        'ink-muted': '#9CA3AF',
        success: '#10B981',
        'success-bg': '#D1FAE5',
        'success-ink': '#059669',
        warning: '#F59E0B',
        'warning-bg': '#FDE68A',
        danger: '#EF4444',
        'danger-bg': '#FEE2E2',
        'accent-purple': '#7C3AED',
        'accent-purple-bg': '#EDE9FE',
        'accent-pink': '#DB2777',
        'accent-pink-bg': '#FCE7F3',
        'accent-blue': '#2563EB',
        'accent-blue-bg': '#DBEAFE',
        'accent-teal': '#0D9488',
        'accent-teal-bg': '#CCFBF1',
      },
      letterSpacing: {
        tight: '-0.4px',
        wide: '0.9px',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      fontWeight: {
        '500': '500',
        '600': '600',
        '700': '700',
        '800': '800',
      },
    },
  },
  plugins: [],
};
