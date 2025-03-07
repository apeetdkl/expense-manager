module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],

  theme: {
    extend: {
      colors: {
        dark: {
          900: '#121212',   // Deep background
          800: '#1E1E1E',   // Card background
          700: '#2A2A2A',   // Component background
          600: '#3A3A3A',   // Borders, subtle elements
        }
      }
    }
  },
  variants: {},
  plugins: []
};

