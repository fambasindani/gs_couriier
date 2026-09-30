/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000091',
          hover: '#1212ff',
          light: '#e3e3fd',
        },
        sidebar: {
          DEFAULT: '#1e1e2d',
          hover: '#2a2a3d',
          brand: '#16162a',
          text: '#cfcfd8',
          muted: '#6a6a7e',
        },
        ink: '#161616',
        surface: '#f5f5fe',
        line: '#e5e5e5',
        success: '#18753c',
        warning: '#b34000',
        danger: '#ce0500',
        info: '#0063cb',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        'card-hover': '0 4px 12px -2px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
