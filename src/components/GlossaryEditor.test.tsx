import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Glossary } from '@/lib/glossary';
import { renderApp } from '@/test/render';
import GlossaryEditor from './GlossaryEditor';

const glossary: Glossary = {
  id: 'g1',
  name: 'Tyska',
  fromLanguage: 'se',
  toLanguage: 'de',
  items: [
    { id: 'w1', a: 'Hus', b: 'Haus' },
    { id: 'w2', a: 'Bil', b: 'Auto' },
  ],
};

describe('GlossaryEditor', () => {
  it('shows every word pair with accessible names that say row and language', () => {
    renderApp(<GlossaryEditor glossary={glossary} dispatch={vi.fn()} />);
    expect(screen.getByRole('textbox', { name: 'Ord 1, vänster (svenska)' })).toHaveValue('Hus');
    expect(screen.getByRole('textbox', { name: 'Ord 1, höger (tyska)' })).toHaveValue('Haus');
    expect(screen.getByRole('textbox', { name: 'Ord 2, vänster (svenska)' })).toHaveValue('Bil');
    expect(screen.getByText('2 ord')).toBeInTheDocument();
  });

  it('says so when the list is empty', () => {
    renderApp(<GlossaryEditor glossary={{ ...glossary, items: [] }} dispatch={vi.fn()} />);
    expect(screen.getByText(/Listan är tom/)).toBeInTheDocument();
  });

  it('edits a word by its id', async () => {
    const dispatch = vi.fn();
    renderApp(<GlossaryEditor glossary={glossary} dispatch={dispatch} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Ord 2, höger (tyska)' }), 'x');
    expect(dispatch).toHaveBeenCalledWith({ type: 'updateWord', id: 'g1', wordId: 'w2', field: 'b', value: 'Autox' });
  });

  it('removes a word pair', async () => {
    const dispatch = vi.fn();
    renderApp(<GlossaryEditor glossary={glossary} dispatch={dispatch} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ta bort ordpar 1' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'removeWord', id: 'g1', wordId: 'w1' });
  });

  it('adds a pair with Enter and puts focus back in the first field', async () => {
    const dispatch = vi.fn();
    renderApp(<GlossaryEditor glossary={glossary} dispatch={dispatch} />);
    const first = screen.getByRole('textbox', { name: 'Nytt ord på svenska' });
    await userEvent.type(first, 'Katt');
    await userEvent.type(screen.getByRole('textbox', { name: 'Nytt ord på tyska' }), 'Katze{Enter}');
    expect(dispatch).toHaveBeenCalledWith({ type: 'addWord', id: 'g1', a: 'Katt', b: 'Katze' });
    expect(first).toHaveValue('');
    expect(first).toHaveFocus();
  });

  it('adds nothing and moves focus to the empty field when a side is missing', async () => {
    const dispatch = vi.fn();
    renderApp(<GlossaryEditor glossary={glossary} dispatch={dispatch} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Nytt ord på svenska' }), 'Katt{Enter}');
    expect(dispatch).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'Nytt ord på tyska' })).toHaveFocus();
  });

  it('adds with the button too', async () => {
    const dispatch = vi.fn();
    renderApp(<GlossaryEditor glossary={glossary} dispatch={dispatch} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Nytt ord på svenska' }), 'Katt');
    await userEvent.type(screen.getByRole('textbox', { name: 'Nytt ord på tyska' }), 'Katze');
    await userEvent.click(screen.getByRole('button', { name: 'Lägg till ordpar' }));
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('keeps å ä ö in what the user types', async () => {
    const dispatch = vi.fn();
    renderApp(<GlossaryEditor glossary={glossary} dispatch={dispatch} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Nytt ord på svenska' }), 'Sjö åäö');
    await userEvent.type(screen.getByRole('textbox', { name: 'Nytt ord på tyska' }), 'See{Enter}');
    expect(dispatch).toHaveBeenCalledWith({ type: 'addWord', id: 'g1', a: 'Sjö åäö', b: 'See' });
  });

  it('turns off autocapitalisation and spell checking on word fields', () => {
    renderApp(<GlossaryEditor glossary={glossary} dispatch={vi.fn()} />);
    const field = screen.getByRole('textbox', { name: 'Ord 1, vänster (svenska)' });
    expect(field).toHaveAttribute('autocapitalize', 'none');
    expect(field).toHaveAttribute('spellcheck', 'false');
  });
});
