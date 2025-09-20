/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          green: '#28a745',  // Verde principal
          teal: '#00a7c4',   // Turquesa
          light: '#f5f5f5',  // Gris claro
          dark: '#1b4332'    // Verde oscuro opcional
        },
      },
    },
  },
  plugins: [],
}
