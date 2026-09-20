import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FFFFFF",
        pearl: "#F7F5F5",
        graphite: "#1A1A1A",
        ink: "#3A3B40",
        steel: "#6B6E76",
        brand: "#D92B2B",
        "brand-dark": "#B31E1E",
        "brand-light": "#FCEAEA",
        hairline: "#EBE7E7",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-manrope)", "sans-serif"],
      },
      letterSpacing: {
        wide2: "0.08em",
      },
      maxWidth: {
        content: "1360px",
      },
    },
  },
  plugins: [],
};
export default config;
