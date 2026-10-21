import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { navigationState, renderApp } from '@/test/render';
import AppHeader from './AppHeader';

beforeEach(() => {
  navigationState.pathname = '/edit';
});

describe('AppHeader', () => {
  it('links to both pages from a labelled navigation', () => {
    renderApp(<AppHeader />);
    const nav = screen.getByRole('navigation', { name: 'Huvudmeny' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Listor' })).toHaveAttribute('href', '/edit');
    expect(screen.getByRole('link', { name: 'Öva' })).toHaveAttribute('href', '/train');
  });

  it('marks the current page for assistive technology', () => {
    renderApp(<AppHeader />);
    expect(screen.getByRole('link', { name: 'Listor' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Öva' })).not.toHaveAttribute('aria-current');
  });

  it('follows the route', () => {
    navigationState.pathname = '/train';
    renderApp(<AppHeader />);
    expect(screen.getByRole('link', { name: 'Öva' })).toHaveAttribute('aria-current', 'page');
  });

  it('has the brand link home', () => {
    renderApp(<AppHeader />);
    expect(screen.getByRole('link', { name: /Glosorna/ })).toHaveAttribute('href', '/edit');
  });
});
