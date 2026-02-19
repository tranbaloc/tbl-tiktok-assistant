export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const COLORS = {
  black: {
    DEFAULT: '#000000',
    50: '#1a1a1a',
    100: '#111111',
    200: '#0a0a0a',
  },
  green: {
    DEFAULT: '#22C55E',
    50: '#22C55E',
    100: '#16a34a',
    200: '#15803d',
    300: '#166534',
  },
} as const;

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
