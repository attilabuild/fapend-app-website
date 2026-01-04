/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#080808',
        accent: '#3a86ff',
        dark: {
          100: '#101010',
          200: '#080808',
          300: '#050505',
          400: '#030303',
          500: '#000000',
        },
        text: {
          primary: '#ffffff',
          secondary: '#b3b3b3',
          muted: '#6b7280',
        },
        gradient: {
          blue: {
            start: '#3a86ff',
            mid: '#2563eb',
            end: '#1e40af',
          },
          purple: {
            start: '#8b5cf6',
            mid: '#7c3aed',
            end: '#6d28d9',
          }
        }
      },
      boxShadow: {
        'dark': '0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
        'dark-lg': '0 10px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 15px rgba(58, 134, 255, 0.3), 0 0 5px rgba(58, 134, 255, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-dots': 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23333333\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'1\' cy=\'1\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")',
        'gradient-grid': 'linear-gradient(rgba(50, 50, 50, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(50, 50, 50, 0.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
    },
  },
  plugins: [],
}; 