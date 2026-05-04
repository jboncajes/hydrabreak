/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        hydra: {
          50:  "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49"
        }
      },
      fontFamily: {
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"]
      },
      backdropBlur: {
        xs: "2px"
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "ripple": "ripple 2.4s ease-out infinite",
        "wave": "wave 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(24px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        },
        ripple: {
          "0%":   { transform: "scale(0.9)", opacity: 0.6 },
          "100%": { transform: "scale(1.6)", opacity: 0 }
        },
        wave: {
          "0%, 100%": { transform: "translateX(0) translateY(0)" },
          "50%":      { transform: "translateX(-8px) translateY(4px)" }
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: 0.7 },
          "50%":      { opacity: 1 }
        }
      },
      boxShadow: {
        "glass":     "0 8px 32px 0 rgba(8, 47, 73, 0.18)",
        "glass-lg":  "0 16px 48px 0 rgba(8, 47, 73, 0.25)",
        "glow":      "0 0 40px rgba(14, 165, 233, 0.45)",
        "inner-soft":"inset 0 2px 8px rgba(255, 255, 255, 0.4)"
      }
    }
  },
  plugins: []
};
