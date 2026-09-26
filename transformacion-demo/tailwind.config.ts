import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#64748B",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      }
    },
  },
  plugins: [],
} satisfies Config
