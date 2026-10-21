import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Glossary } from '@/lib/glossary';
import { renderApp } from '@/test/render';
import PracticeBar from './PracticeBar';

const glossary: Glossary = {
  id: 'g',
  name: 'x',
  fromLanguage: 'se',
  toLanguage: 'de',
  items: [{ id: '1', a: 'a', b: 'b' }],
};

describe('PracticeBar', () => {
  it('starts in both directions by default', async () => {
    const onStart = vi.fn();
    renderApp(<PracticeBar glossary={glossary} onStart={onStart} />);
    await userEvent.click(screen.getByRole('button', { name: 'Börja öva' }));
    expect(onStart).toHaveBeenCalledWith('both');
  });

  it('starts in the chosen direction', async () => {
    const onStart = vi.fn();
    renderApp(<PracticeBar glossary={glossary} onStart={onStart} />);
    await userEvent.click(screen.getByText('🇩🇪 → 🇸🇪'));
    await userEvent.click(screen.getByRole('button', { name: 'Börja öva' }));
    expect(onStart).toHaveBeenCalledWith('toFrom');
  });

  it('cannot start an empty list and explains why', () => {
    renderApp(<PracticeBar glossary={{ ...glossary, items: [] }} onStart={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Börja öva' })).toBeDisabled();
    expect(screen.getByText(/minst ett ordpar/)).toBeInTheDocument();
  });
});
