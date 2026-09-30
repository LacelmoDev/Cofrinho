/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rosa: { DEFAULT: '#EC5C82', light: '#FDEBEF', dark: '#B03A5F' },
        dourado: { DEFAULT: '#F4B740', dark: '#E0A02E' },
        verde: { DEFAULT: '#3FB07E', light: '#E9F7F0', dark: '#21744B' },
        fundo: { DEFAULT: '#FFFCF7', dark: '#100D12' },
        cartao: { DEFAULT: '#FFFFFF', dark: '#1A1620' },
        texto: { DEFAULT: '#3A332E', dark: '#F6F1F4' },
        textosec: { DEFAULT: '#6F6356', dark: '#A69DAB' },
        borda: { DEFAULT: '#F0E8DC', dark: '#2A2431' }
      },
      fontFamily: {
        sora: ['Sora', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 8px 30px -8px rgba(58, 51, 46, 0.14)',
        rosa: '0 12px 30px -10px rgba(236, 92, 130, 0.55)',
        dourado: '0 10px 24px -8px rgba(244, 183, 64, 0.65)'
      }
    }
  },
  plugins: []
}
