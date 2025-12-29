/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4ce1b6',
        secondary: '#70bbfd',
        danger: '#ff4861',
        warning: '#f6da6e',
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
