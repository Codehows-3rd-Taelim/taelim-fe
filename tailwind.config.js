/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4ce1b6',
        },
        secondary: {
          DEFAULT: '#70bbfd',
        },
        danger: {
          DEFAULT: '#ff4861',
        },
        warning: {
          DEFAULT: '#f6da6e',
        },
      },
      keyframes: {
        "slide-down": {
          "0%": {
            opacity: "0",
            transform: "translate(-50%, -10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translate(-50%, 0)",
          },
        },
      },
      animation: {
        "slide-down": "slide-down 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
