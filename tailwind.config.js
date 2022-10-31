/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#dfc38a",
          secondary: "#322306",
          "accent-light": "#928569",
          "accent-dark": "#0d3d28",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
