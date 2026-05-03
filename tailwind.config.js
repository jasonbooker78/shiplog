/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: {
          base: '#f5f3ef',
          surface: '#ffffff',
          elevated: '#faf9f7',
        },
        border: {
          subtle: '#e8e4dc',
          mid: '#d4cfc6',
        },
        text: {
          primary: '#1a1816',
          secondary: '#5c5750',
          dim: '#9c9690',
        },
        accent: {
          DEFAULT: '#c4973a',
          hover: '#b08530',
        },
        priority: {
          critical: '#dc4f3e',
          high: '#d4722a',
          medium: '#c49a2a',
          low: '#7a7570',
        },
      },
    },
  },
  plugins: [],
}

