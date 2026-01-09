/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['selector','[data-color-mode="dark"]'],
  theme: {
    extend: {
      colors: {
        'theme': '#00FF41',
        'theme-hover': '#00CC34',
        'theme-active': '#00AA2B',
        'cyber': {
          'green': '#00FF41',
          'dark': '#0D0D0D',
          'light': '#E0E0E0',
        },
        'background': {
          'light': '#F8FAFC',
          'dark': '#0D0D0D',
        },
        'dark': "#0F172A"
      },
      fontFamily: {
        'heading': ['Space Grotesk', 'sans-serif'],
        'body': ['DM Sans', 'sans-serif'],
      },
      transitionProperty: {
        'height': 'height',
        'width': 'width',
        'spacing': 'margin, padding',
      },
      backdropBlur: {
        'glass': '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 255, 65, 0.6)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

