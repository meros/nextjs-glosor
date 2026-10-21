import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'teal',
  // Shade 9 keeps white button text above 4.5:1 in both color schemes.
  primaryShade: 9,
  defaultRadius: 'md',
  fontFamily:
    'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  headings: {
    fontWeight: '700',
    sizes: {
      h1: { fontSize: 'clamp(1.5rem, 1.2rem + 1.5vw, 2rem)', lineHeight: '1.2' },
      h2: { fontSize: 'clamp(1.25rem, 1.1rem + 0.8vw, 1.5rem)', lineHeight: '1.3' },
    },
  },
  components: {
    Button: { defaultProps: { size: 'md' } },
    TextInput: { defaultProps: { size: 'md' } },
    Select: { defaultProps: { size: 'md', allowDeselect: false } },
  },
});
