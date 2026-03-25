import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'], // A Poppins vira a fonte padrão de tudo
        monigue: ['var(--font-Monigue)', 'sans-serif'],
        collsmith: ['var(--font-Collsmith)', 'sans-serif'],
      },
      colors: {
        // ... (as suas cores elroi-blue, etc, já devem estar aqui, NÃO apague elas!)
        'elroi-blue': '#1C2E4A',
        'elroi-sand': '#D9D7CF',
        'elroi-gray': '#3C3C3C',
        'elroi-lightblue': '#E6ECFD',
        'elroi-black': '#111111',
      },
    },
  },
  plugins: [],
};

export default config;
