import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        ember: "#f97316",
        mist: "#f8fafc",
        dusk: "#0b1220"
      },
      boxShadow: {
        glow: "0 0 30px rgba(249, 115, 22, 0.25)",
        soft: "0 20px 50px rgba(15, 23, 42, 0.08)"
      },
      animation: {
        float: "float 12s ease-in-out infinite",
        fadeIn: "fadeIn 0.7s ease-out",
        rise: "rise 0.6s ease-out"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-18px)" }
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
