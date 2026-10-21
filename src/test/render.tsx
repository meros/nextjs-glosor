import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { vi } from 'vitest';
import { theme } from '@/theme';
import { GlossaryProvider } from '@/state/GlossaryProvider';
import { PracticeProvider } from '@/state/PracticeProvider';

export const routerMock = { push: vi.fn(), replace: vi.fn(), back: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() };
export const navigationState = { pathname: '/edit', search: '' };

vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
  usePathname: () => navigationState.pathname,
  useSearchParams: () => new URLSearchParams(navigationState.search),
}));

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme} env="test">
      <GlossaryProvider>
        <PracticeProvider>{children}</PracticeProvider>
      </GlossaryProvider>
    </MantineProvider>
  );
}

export function renderApp(ui: ReactElement, saved: Record<string, unknown> = {}) {
  for (const [key, value] of Object.entries(saved)) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
  return render(ui, { wrapper: Wrapper });
}
