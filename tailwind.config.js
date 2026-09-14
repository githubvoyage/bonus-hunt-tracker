/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#07040F',
          deep: '#120A24',
          panel: '#1B1035',
          raised: '#251545',
        },
        line: {
          DEFAULT: '#3A2166',
          bright: '#5B33A0',
        },
        gold: {
          DEFAULT: '#FFC531',
          bright: '#FFE066',
          deep: '#C98A00',
        },
        pink: '#FF2E88',
        cyan: '#22E4FF',
        violet: '#A855F7',
        cream: '#F5EDFF',
        muted: '#9B86C4',
        win: '#00FFA3',
        loss: '#FF4365',
      },
      fontFamily: {
        display: ['Bungee', 'Impact', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-gold': '0 0 12px rgba(255,197,49,.55), 0 0 34px rgba(255,197,49,.22)',
        'neon-pink': '0 0 12px rgba(255,46,136,.6), 0 0 34px rgba(255,46,136,.25)',
        'neon-cyan': '0 0 12px rgba(34,228,255,.55), 0 0 34px rgba(34,228,255,.22)',
        'neon-win': '0 0 14px rgba(0,255,163,.55), 0 0 36px rgba(0,255,163,.22)',
        panel: '0 18px 50px -20px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.05)',
      },
    },
  },
  plugins: [],
}
