/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#e2e8f0",
        glow: "#22c55e",
        sky: "#38bdf8",
        sun: "#fbbf24"
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"]
      },
      boxShadow: {
        soft: "0 12px 30px rgba(15, 23, 42, 0.15)",
        glow: "0 0 40px rgba(34, 197, 94, 0.35)"
      }
    }
  },
  plugins: []
};
