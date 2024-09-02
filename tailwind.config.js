/** @type {import('tailwindcss').Config} */
import { fontFamily as _fontFamily } from 'tailwindcss/defaultTheme';

export const content = [
  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  // "./src/utils/**/*.{js,ts,jsx,tsx,mdx}",
];
export const darkMode = 'class'; 

export const theme = {
  extend: {
    height:{
      "screen-header": "calc(100vh - 80px)",
      "screen-header-subtitle": "calc(100vh - 168px)",
      "screen-header-subtitle-sm": "calc(100vh - 140px)",
      "screen-header-subtitle-md": "calc(100vh - 144px)",
      "screen-header-subtitle-lg": "calc(100vh - 148px)", 
    },
    boxShadow:{
      "dark": "0 1px 3px 0 rgb(255 255 255 / 8%), 0 1px 2px -1px rgb(8 8 8 / 69%);"
    },
    colors: {
      azul: {
        900: '#5A9CDA',
        800: '#F6FAFD',
        700: '#F0F9FF'
      },
      cinza: {
        950: '#404040',
        900: '#A3A3A3',
        800: '#EFEFEF',
        700: '#e0e0e0'
      },
      verde: {
        900: '#46DB5E'
      },
      vermelho: {
        900: '#DA1C1C'
      },

      dark: {
        900: '#121212',
        800: '#1d2022',
        700: '#1b2226',
        600: '#383b40',
        500: '#1b2226',
        100: '#272a2b',
      }
    },
    fontFamily: {
      'sans': ["'Montserrat'", ..._fontFamily.sans]
    }
  },
};
export const plugins = [];
