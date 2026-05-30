/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#030712',
          card: 'rgba(15, 23, 42, 0.65)',
          border: 'rgba(14, 165, 233, 0.15)',
          cyan: '#0EA5E9',
          cyanHover: '#38BDF8',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B',
          slate: '#94A3B8',
          text: '#F8FAFC'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      },
      boxShadow: {
        'cyber-cyan': '0 0 15px rgba(14, 165, 233, 0.25)',
        'cyber-rose': '0 0 15px rgba(244, 63, 94, 0.25)',
        'cyber-emerald': '0 0 15px rgba(16, 185, 129, 0.25)',
        'cyber-amber': '0 0 15px rgba(245, 158, 11, 0.25)'
      }
    },
  },
  plugins: [],
}
