/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
      },
      colors: {
        biome: {
          badlands: { bg: '#000000', fg: '#FFFFFF', accent: '#888888' },
          volcanic: { bg: '#1A0A00', fg: '#FFD700', accent: '#FF6B35' },
          jungle: { bg: '#1A0800', fg: '#7BC950', accent: '#2D5016' },
          tundra: { bg: '#001A33', fg: '#FFFFFF', accent: '#B8D4E8' },
          final: { bg: '#000000', fg: '#FF6600', accent: '#FF0000' }
        }
      }
    },
  },
  plugins: [],
}
