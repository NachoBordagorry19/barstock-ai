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
          50: "#f5f6ff",
          100: "#ebedff",
          200: "#cbd2ff",
          300: "#9fa8ff",
          400: "#707eff",
          500: "#4f5ff5",
          600: "#3947db",
          700: "#2c35b8",
          800: "#212891",
          900: "#171b69",
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
        glow: "0 0 0 1px rgba(79, 95, 245, 0.18), 0 8px 40px -12px rgba(79, 95, 245, 0.35)",
      },
    },
  },
  plugins: [],
};
