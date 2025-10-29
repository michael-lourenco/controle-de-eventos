import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-dark": "var(--primary-dark)",
        secondary: "var(--secondary)",
        "secondary-dark": "var(--secondary-dark)",
        accent: "var(--accent)",
        "accent-dark": "var(--accent-dark)",
        neutral: "var(--neutral)",
        "neutral-light": "var(--neutral-light)",
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        border: "var(--border)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(27 33 38 / 0.05)',
        'md': '0 4px 6px -1px rgb(27 33 38 / 0.1), 0 2px 4px -2px rgb(27 33 38 / 0.1)',
        'lg': '0 10px 15px -3px rgb(27 33 38 / 0.1), 0 4px 6px -4px rgb(27 33 38 / 0.1)',
        'xl': '0 20px 25px -5px rgb(27 33 38 / 0.1), 0 8px 10px -6px rgb(27 33 38 / 0.1)',
        '3xl': '0 35px 60px -12px rgb(27 33 38 / 0.25), 0 20px 25px -5px rgb(27 33 38 / 0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
