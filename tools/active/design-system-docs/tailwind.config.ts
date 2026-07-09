import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff4ff",
          100: "#d1e0ff",
          200: "#b2ccff",
          300: "#84adff",
          400: "#528bff",
          500: "#2970ff",
          600: "#155eef",
          700: "#004eeb",
          800: "#0040c1",
          900: "#00359e",
        },
        gray: {
          25: "#fcfcfd",
          50: "#f9fafb",
          100: "#f2f4f7",
          200: "#eaecf0",
          300: "#d0d5dd",
          400: "#98a2b3",
          500: "#667085",
          600: "#475467",
          700: "#344054",
          800: "#1d2939",
          900: "#101828",
          950: "#0a0d12",
        },
        // Refined dark-mode surfaces — never pure black.
        surface: {
          base: "#0b0f17",
          raised: "#121826",
          overlay: "#1a2233",
          line: "#232d42",
        },
        violet: {
          400: "#a48afb",
          500: "#875bf7",
          600: "#7839ee",
        },
      },
      fontSize: {
        body: ["14px", "20px"],
        sub: ["13px", "18px"],
        heading: ["16px", "24px"],
      },
      boxShadow: {
        canvas:
          "0 12px 16px -4px rgba(16,24,40,0.08), 0 4px 6px -2px rgba(16,24,40,0.03)",
        card: "0 1px 2px rgba(16,24,40,0.05), 0 1px 3px rgba(16,24,40,0.06)",
        lift: "0 12px 24px -6px rgba(16,24,40,0.14), 0 4px 8px -3px rgba(16,24,40,0.06)",
        modal:
          "0 20px 24px -4px rgba(16,24,40,0.08), 0 8px 8px -4px rgba(16,24,40,0.03)",
      },
      animation: {
        "gradient-x": "gradient-x 8s ease infinite",
        "float-slow": "float 7s ease-in-out infinite",
        "float-slower": "float 9s ease-in-out infinite",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
