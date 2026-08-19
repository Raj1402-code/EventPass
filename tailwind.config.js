/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#E5E7EB",
        input: "#E5E7EB",
        ring: "#006D77",
        background: "#F8F9FA",
        foreground: "#1F2937",
        primary: {
          DEFAULT: "#006D77",
          hover: "#004D55",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#83C5BE",
          foreground: "#004D55",
        },
        accent: {
          DEFAULT: "#E29578",
          foreground: "#FFFFFF",
        },
        dark: {
          DEFAULT: "#111827",
          surface: "#1F2937",
          border: "#374151",
        },
        muted: {
          DEFAULT: "#F3F4F6",
          foreground: "#6B7280",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#16A34A",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: 0.6, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.05)" },
        },
        "signal-flow": {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        }
      },
      animation: {
        "pulse-glow": "pulse-glow 3s infinite ease-in-out",
        "signal-flow": "signal-flow 2s linear infinite",
        "float": "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
