/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fdfaf0",
          100: "#fdf6e3",
          200: "#f8e6b0",
          300: "#f0d27a",
          400: "#e6b94a",
          500: "#d4a017",
          600: "#b8870f",
          700: "#92690d",
          800: "#6e4f0f",
          900: "#4d380c",
        },
        ink: {
          900: "#0a0c12",
          850: "#0e111a",
          800: "#141826",
          700: "#1c2233",
          600: "#262d42",
          500: "#36405c",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(212,160,23,0.18), 0 8px 40px -12px rgba(212,160,23,0.35)",
      },
    },
  },
  plugins: [],
};
