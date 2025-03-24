/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./Views/**/*.ejs",  // Ensure Tailwind scans HTML files
    "./Public/**/*.html", // Include HTML files from Public if needed
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],
  daisyui: {
    themes: ["dim", "light", "dark"], // Add multiple themes for testing
  },
};
