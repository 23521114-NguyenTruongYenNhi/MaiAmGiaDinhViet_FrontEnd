/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#8B1D1D',
        cream: '#FAF7F2',
        mustard: '#D6A84A',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      },
      fontFamily: {
        sans: ['BeVietnamPro_400Regular'],
        beRegular: ['BeVietnamPro_400Regular'],
        beMedium: ['BeVietnamPro_500Medium'],
        beSemiBold: ['BeVietnamPro_600SemiBold'],
        beBold: ['BeVietnamPro_700Bold'],
      },
      boxShadow: {
        soft: '0px 4px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
