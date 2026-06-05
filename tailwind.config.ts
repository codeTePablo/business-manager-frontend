/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        accent: {
          DEFAULT: '#1d4ed8',
          hover:   '#1e40af',
          light:   '#eff6ff',
          border:  '#bfdbfe',
        },
        surface: {
          DEFAULT: '#ffffff',
          raised:  '#f9fafb',
          inset:   '#f3f4f6',
        },
        border: {
          DEFAULT: '#e5e7eb',
          strong:  '#d1d5db',
        },
        text: {
          DEFAULT: '#111827',
          muted:   '#6b7280',
          subtle:  '#9ca3af',
        },
        success: { DEFAULT: '#15803d', light: '#f0fdf4', border: '#bbf7d0' },
        warning: { DEFAULT: '#b45309', light: '#fffbeb', border: '#fde68a' },
        danger:  { DEFAULT: '#b91c1c', light: '#fef2f2', border: '#fecaca' },
      },
      boxShadow: {
        card:       '0 1px 3px 0 rgb(0 0 0/0.06),0 1px 2px -1px rgb(0 0 0/0.06)',
        'card-hover':'0 4px 6px -1px rgb(0 0 0/0.08),0 2px 4px -2px rgb(0 0 0/0.06)',
        modal:      '0 20px 25px -5px rgb(0 0 0/0.1),0 8px 10px -6px rgb(0 0 0/0.08)',
      },
      borderRadius: { DEFAULT: '6px', lg: '10px', xl: '14px' },
    },
  },
  plugins: [],
}
