/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E40AF',
          hover: '#1D4ED8',
          light: '#DBEAFE',
          dark: '#1E3A8A',
        },
        secondary: {
          DEFAULT: '#6B7280',
          hover: '#4B5563',
          light: '#F3F4F6',
          dark: '#374151',
        },
        success: {
          DEFAULT: '#10B981',
          hover: '#059669',
          light: '#D1FAE5',
        },
        error: {
          DEFAULT: '#EF4444',
          hover: '#DC2626',
          light: '#FEE2E2',
        },
        customBg: {
          DEFAULT: '#FFFFFF',
          alt: '#F3F4F6',
        },
        customText: {
          DEFAULT: '#1F2937',
          muted: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '8px': '8px',
      },
      borderRadius: {
        'DEFAULT': '8px',
      },
      boxShadow: {
        'subtle': '0 2px 4px rgba(0, 0, 0, 0.05)',
        'premium': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
