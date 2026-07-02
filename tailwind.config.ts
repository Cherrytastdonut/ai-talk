import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cloud: {
          50: "#fbfcff",
          100: "#eef5ff",
          200: "#d8e9ff"
        },
        meadow: {
          100: "#def7ed",
          500: "#3c9b77"
        },
        rosecalm: {
          100: "#ffe8ee",
          500: "#ce6079"
        },
        ink: {
          700: "#24313d",
          900: "#121820"
        }
      },
      boxShadow: {
        soft: "0 20px 60px rgba(36, 49, 61, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
