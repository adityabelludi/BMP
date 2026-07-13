import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // BMP Brand palette
        saffron: {
          DEFAULT: "#FF9933",
          50: "#FFF4E6",
          100: "#FFE7C7",
          200: "#FFD199",
          300: "#FFBB66",
          400: "#FFA64D",
          500: "#FF9933",
          600: "#E67E1A",
          700: "#B85F0F",
          800: "#8A4708",
          900: "#5C2F04",
        },
        turmeric: {
          DEFAULT: "#FFB800",
          400: "#FFC633",
          500: "#FFB800",
          600: "#D69B00",
        },
        maroon: {
          DEFAULT: "#7A1E1E",
          50: "#FAEDED",
          100: "#F2D6D6",
          200: "#E3ADAD",
          300: "#CF8080",
          400: "#B15050",
          500: "#7A1E1E",
          600: "#651616",
          700: "#4F1010",
          800: "#3D0C0C",
          900: "#2A0808",
        },
        earth: {
          DEFAULT: "#5B6B3A",
          400: "#77894F",
          500: "#5B6B3A",
          600: "#47542C",
        },
        cream: {
          DEFAULT: "#FBF7F0",
          100: "#FDFBF6",
          200: "#F6EFE3",
          300: "#EFE4D2",
        },
        // shadcn tokens
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      backgroundImage: {
        "rangoli":
          "radial-gradient(circle at 1px 1px, rgba(255,153,51,0.12) 1px, transparent 0)",
        "hero-warm":
          "linear-gradient(135deg, #FBF7F0 0%, #FFF4E6 55%, #FFE7C7 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        "fade-in": "fade-in 0.5s ease-out both",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
