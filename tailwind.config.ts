import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--color-primary)",
          secondary: "var(--color-secondary)",
          accent: "var(--color-accent)",
          bg: "var(--color-bg)",
          surface: "var(--color-surface)",
          text: "var(--color-text)",
          "primary-hover": "#8C2E1A",
          "primary-light": "#FDF3F0",
          "secondary-light": "#FEECE7",
          "accent-light": "#FEF3C7",
          border: "#E7E2DF",
          muted: "#78716C",
          subtle: "#A8A29E",
          success: "#10B981",
          "success-light": "#ECFDF5",
          danger: "#DC2626",
          "danger-light": "#FEF2F2",
          warning: "#F59E0B",
          "warning-light": "#FFFBEB",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sarabun)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "'Helvetica Neue'",
          "sans-serif",
        ],
      },
      boxShadow: {
        m3: "0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)",
        "m3-md": "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.07)",
        "m3-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.07)",
        "m3-elevation-1": "0px 1px 2px 0px rgba(0,0,0,0.3), 0px 1px 3px 1px rgba(0,0,0,0.15)",
        "m3-elevation-2": "0px 1px 2px 0px rgba(0,0,0,0.3), 0px 2px 6px 2px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
