import React from 'react';

import { createTheme, MantineProvider } from '@mantine/core';
import type { Preview } from '@storybook/react';

import '@mantine/core/styles.css';

const theme = createTheme({
  // Add any theme customization here if needed
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <MantineProvider theme={theme}>
        <Story />
      </MantineProvider>
    ),
  ],
};

export default preview;
