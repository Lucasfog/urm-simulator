/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Source Serif 4', 'serif'],
      },
      keyframes: {
        tapeScan: {
          '0%': { transform: 'translateX(-160%)' },
          '100%': { transform: 'translateX(520%)' },
        },
        tapePulse: {
          '0%': { transform: 'scale(1)', backgroundColor: '#f8f5e8' },
          '40%': { transform: 'scale(1.02)', backgroundColor: '#e3f4df' },
          '100%': { transform: 'scale(1)', backgroundColor: '#f8f5e8' },
        },
      },
      animation: {
        'tape-scan': 'tapeScan 1.2s linear infinite',
        'tape-pulse': 'tapePulse 400ms ease-out',
      },
    },
  },
  plugins: [],
}
