module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  safelist: [
    { pattern: /bg-\[.*\]/ },
    { pattern: /text-\[.*\]/ },
    { pattern: /border-\[.*\]/ },
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': '#ccff00',
        'bg-dark': '#121212',
        'bg-panel': '#1e1e1e',
        'text-muted': '#888',
        'border-dark': '#333',
      },
      fontFamily: {
        'rajdhani': ['Rajdhani', 'sans-serif'],
        'teko': ['Teko', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
