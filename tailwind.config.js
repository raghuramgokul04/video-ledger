/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core backgrounds
        'vl-bg':        '#060d06',
        'vl-surface':   '#0c140c',
        'vl-surface2':  '#101810',
        'vl-elevated':  '#141f14',
        // Borders
        'vl-border':    '#1c2e1c',
        'vl-border2':   '#243824',
        // Brand greens
        'vl-green':     '#28c964',
        'vl-green-dim': '#1e9b4b',
        // Status colors
        'vl-amber':     '#f0a500',
        'vl-red':       '#f04040',
        // Text hierarchy
        'vl-text':      '#eef1ee',
        'vl-text2':     '#b8c4b8',
        'vl-muted':     '#7a9a7a',
        'vl-subtle':    '#4a6a4a',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Menlo', '"Courier New"', 'monospace'],
      },
      borderRadius: {
        'xl2': '14px',
      },
      boxShadow: {
        'card':  '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(28,46,28,0.8)',
        'glow':  '0 0 20px rgba(40,201,100,0.08)',
        'glow2': '0 0 0 1px rgba(40,201,100,0.15)',
      },
    },
  },
  plugins: [],
}
