/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Same palette as the old CSS variables — just moved into Tailwind's
        // theme so every component can use e.g. bg-ink, text-gold-bright, border-line
        ink:    "#0b0906",
        panel:  "#16130d",
        panel2: "#1e1810",
        gold: {
          DEFAULT: "#c9a961",
          bright:  "#e9cc85",
          deep:    "#8a6d2f",
        },
        warm:  "#f3ead9",
        muted: "#a6987c",
        line:  "rgba(201, 169, 97, 0.22)",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "serif"],
        body: ["Jost", "sans-serif"],
      },
    },
  },
  plugins: [],
};
