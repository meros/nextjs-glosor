import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { routerMock, renderApp } from '@/test/render';
import EditPage from './page';

const saved = {
  glossaries: [
    {
      id: 'a',
      name: 'Engelska',
      fromLanguage: 'se',
      toLanguage: 'en',
      items: [
        { id: '1', a: 'Hund', b: 'Dog' },
        { id: '2', a: 'Katt', b: 'Cat' },
      ],
    },
    { id: 'b', name: 'Tyska', fromLanguage: 'se', toLanguage: 'de', items: [] },
  ],
  selectedGlossaryId: 'a',
};

beforeEach(() => routerMock.push.mockClear());

function stored<T>(key: string): T {
  return JSON.parse(window.localStorage.getItem(key)!) as T;
}

describe('EditPage', () => {
  it('gives a first-time visitor three sample lists', async () => {
    renderApp(<EditPage />);
    expect(await screen.findByRole('combobox', { name: 'Gloslista' })).toHaveValue('Easy German');
    expect(stored<unknown[]>('glossaries')).toHaveLength(3);
  });

  it('does not bring the samples back after the user deleted every list', async () => {
    renderApp(<EditPage />, { glossaries: [] });
    expect(await screen.findByRole('heading', { name: 'Du har inga listor än' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ny lista' })).toBeInTheDocument();
  });

  it('opens lists saved by the old version, which had no ids and the sv code', async () => {
    renderApp(<EditPage />, {
      glossaries: [{ name: 'Gammal', fromLanguage: 'sv', toLanguage: 'sv', items: [{ a: 'a', b: 'Adam' }] }],
    });
    expect(await screen.findByRole('combobox', { name: 'Gloslista' })).toHaveValue('Gammal');
    expect(screen.getByRole('textbox', { name: 'Ord 1, vänster (svenska)' })).toHaveValue('a');
    expect(screen.getByRole('button', { name: 'Börja öva' })).toBeEnabled();
  });

  it('survives corrupt saved data', async () => {
    window.localStorage.setItem('glossaries', '{broken');
    renderApp(<EditPage />);
    expect(await screen.findByRole('heading', { name: 'Du har inga listor än' })).toBeInTheDocument();
  });

  it('opens the selection that was saved', async () => {
    renderApp(<EditPage />, { ...saved, selectedGlossaryId: 'b' });
    expect(await screen.findByRole('combobox', { name: 'Gloslista' })).toHaveValue('Tyska');
  });

  it('adds a word pair and saves it', async () => {
    renderApp(<EditPage />, saved);
    await screen.findByRole('combobox', { name: 'Gloslista' });
    await userEvent.type(screen.getByRole('textbox', { name: 'Nytt ord på svenska' }), 'Fisk');
    await userEvent.type(screen.getByRole('textbox', { name: 'Nytt ord på engelska' }), 'Fish{Enter}');
    expect(screen.getByRole('textbox', { name: 'Ord 3, höger (engelska)' })).toHaveValue('Fish');
    await waitFor(() => expect(stored<{ items: unknown[] }[]>('glossaries')[0].items).toHaveLength(3));
  });

  it('deletes a word pair', async () => {
    renderApp(<EditPage />, saved);
    await screen.findByRole('combobox', { name: 'Gloslista' });
    await userEvent.click(screen.getByRole('button', { name: 'Ta bort ordpar 1' }));
    expect(screen.getByRole('textbox', { name: 'Ord 1, vänster (svenska)' })).toHaveValue('Katt');
    expect(screen.getByText('1 ord')).toBeInTheDocument();
  });

  it('changes a language and keeps it', async () => {
    renderApp(<EditPage />, saved);
    await screen.findByRole('combobox', { name: 'Gloslista' });
    await userEvent.click(screen.getByRole('combobox', { name: 'Till språk' }));
    await userEvent.click(await screen.findByRole('option', { name: /Franska/ }));
    await waitFor(() => expect(stored<{ toLanguage: string }[]>('glossaries')[0].toLanguage).toBe('fr'));
  });

  it('creates a list and switches to it', async () => {
    renderApp(<EditPage />, saved);
    await screen.findByRole('combobox', { name: 'Gloslista' });
    await userEvent.click(screen.getByRole('button', { name: 'Ny lista' }));
    await userEvent.type(await screen.findByRole('textbox', { name: 'Namn på listan' }), 'Franska{Enter}');
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Gloslista' })).toHaveValue('Franska'));
    expect(screen.getByText(/Listan är tom/)).toBeInTheDocument();
  });

  it('deleting the last list shows the empty state', async () => {
    renderApp(<EditPage />, { glossaries: [saved.glossaries[1]] });
    await screen.findByRole('combobox', { name: 'Gloslista' });
    await userEvent.click(screen.getByRole('button', { name: 'Fler val för listan' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Ta bort lista' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Ta bort' }));
    expect(await screen.findByRole('heading', { name: 'Du har inga listor än' })).toBeInTheDocument();
    await waitFor(() => expect(stored<unknown[]>('glossaries')).toEqual([]));
  });

  it('starts practice in the chosen direction and goes to /train', async () => {
    renderApp(<EditPage />, saved);
    await screen.findByRole('combobox', { name: 'Gloslista' });
    await userEvent.click(screen.getByText('🇸🇪 → 🇬🇧'));
    await userEvent.click(screen.getByRole('button', { name: 'Börja öva' }));
    expect(routerMock.push).toHaveBeenCalledWith('/train');
    await waitFor(() => {
      const cards = stored<{ from: string; to: string }[]>('trainingItems');
      expect(cards.map((c) => [c.from, c.to])).toEqual([
        ['Hund', 'Dog'],
        ['Katt', 'Cat'],
      ]);
    });
  });

  it('cannot start practice on an empty list', async () => {
    renderApp(<EditPage />, { ...saved, selectedGlossaryId: 'b' });
    await screen.findByRole('combobox', { name: 'Gloslista' });
    expect(within(document.body).getByRole('button', { name: 'Börja öva' })).toBeDisabled();
  });
});
