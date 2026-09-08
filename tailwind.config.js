/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        felt: {
          DEFAULT: '#0B2B22',
          light: '#123B2E',
          line: '#1F5240',
        },
        gold: {
          DEFAULT: '#C9A227',
          bright: '#E0BC4A',
        },
        cream: '#F1E9D8',
        muted: '#8FAFA0',
        danger: '#C1443C',
        positive: '#5FAE84',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
