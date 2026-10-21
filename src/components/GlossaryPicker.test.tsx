import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { notifications } from '@mantine/notifications';
import { Glossary } from '@/lib/glossary';
import { renderApp } from '@/test/render';
import GlossaryPicker, { shareGlossary } from './GlossaryPicker';

const lists: Glossary[] = [
  { id: 'a', name: 'Engelska', fromLanguage: 'se', toLanguage: 'en', items: [{ id: '1', a: 'Hund', b: 'Dog' }] },
  { id: 'b', name: 'Tyska', fromLanguage: 'se', toLanguage: 'de', items: [] },
];

beforeEach(() => vi.restoreAllMocks());

describe('GlossaryPicker', () => {
  it('shows the selected list', () => {
    renderApp(<GlossaryPicker glossaries={lists} selected={lists[0]} dispatch={vi.fn()} />);
    expect(screen.getByRole('combobox', { name: 'Gloslista' })).toHaveValue('Engelska');
  });

  it('selects another list', async () => {
    const dispatch = vi.fn();
    renderApp(<GlossaryPicker glossaries={lists} selected={lists[0]} dispatch={dispatch} />);
    await userEvent.click(screen.getByRole('combobox', { name: 'Gloslista' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Tyska' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'select', id: 'b' });
  });

  it('creates a list from the dialog', async () => {
    const dispatch = vi.fn();
    renderApp(<GlossaryPicker glossaries={lists} selected={lists[0]} dispatch={dispatch} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ny lista' }));
    await userEvent.type(await screen.findByRole('textbox', { name: 'Namn på listan' }), 'Franska{Enter}');
    expect(dispatch).toHaveBeenCalledWith({ type: 'create', name: 'Franska' });
  });

  it('refuses a name that is already taken and explains', async () => {
    const dispatch = vi.fn();
    renderApp(<GlossaryPicker glossaries={lists} selected={lists[0]} dispatch={dispatch} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ny lista' }));
    await userEvent.type(await screen.findByRole('textbox', { name: 'Namn på listan' }), 'tyska');
    expect(screen.getByText('Det finns redan en lista med det namnet.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skapa lista' })).toBeDisabled();
  });

  it('cannot create a list without a name', async () => {
    renderApp(<GlossaryPicker glossaries={lists} selected={lists[0]} dispatch={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ny lista' }));
    expect(await screen.findByRole('button', { name: 'Skapa lista' })).toBeDisabled();
  });

  it('renames the selected list, starting from its current name', async () => {
    const dispatch = vi.fn();
    renderApp(<GlossaryPicker glossaries={lists} selected={lists[0]} dispatch={dispatch} />);
    await userEvent.click(screen.getByRole('button', { name: 'Fler val för listan' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Byt namn' }));
    const field = await screen.findByRole('textbox', { name: 'Namn på listan' });
    expect(field).toHaveValue('Engelska');
    await userEvent.clear(field);
    await userEvent.type(field, 'English{Enter}');
    expect(dispatch).toHaveBeenCalledWith({ type: 'rename', id: 'a', name: 'English' });
  });

  it('asks before deleting, and cancel deletes nothing', async () => {
    const dispatch = vi.fn();
    renderApp(<GlossaryPicker glossaries={lists} selected={lists[0]} dispatch={dispatch} />);
    await userEvent.click(screen.getByRole('button', { name: 'Fler val för listan' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Ta bort lista' }));
    expect(await screen.findByText(/Listan "Engelska" med 1 ord tas bort/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Avbryt' }));
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('deletes after confirmation', async () => {
    const dispatch = vi.fn();
    renderApp(<GlossaryPicker glossaries={lists} selected={lists[0]} dispatch={dispatch} />);
    await userEvent.click(screen.getByRole('button', { name: 'Fler val för listan' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Ta bort lista' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Ta bort' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'remove', id: 'a' });
  });

  it('with no lists, offers only the new-list button', () => {
    renderApp(<GlossaryPicker glossaries={[]} selected={null} dispatch={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Ny lista' })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Gloslista' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Fler val för listan' })).not.toBeInTheDocument();
  });
});

describe('shareGlossary', () => {
  it('copies a link that carries the words', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const show = vi.spyOn(notifications, 'show').mockReturnValue('id');
    await shareGlossary(lists[0]);
    expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/\/train\?share=u\./));
    expect(show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Länken är kopierad.' }));
  });

  it('says so when copying fails', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });
    const show = vi.spyOn(notifications, 'show').mockReturnValue('id');
    await shareGlossary(lists[0]);
    await waitFor(() =>
      expect(show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Det gick inte att kopiera länken.' })),
    );
  });

  it('uses the share sheet on touch devices', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share });
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);
    await shareGlossary(lists[0]);
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ title: 'Glosor: Engelska' }));
    Object.assign(navigator, { share: undefined });
  });

  it('is quiet when the user dismisses the share sheet', async () => {
    Object.assign(navigator, { share: vi.fn().mockRejectedValue(new DOMException('x', 'AbortError')) });
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);
    const show = vi.spyOn(notifications, 'show').mockReturnValue('id');
    await shareGlossary(lists[0]);
    expect(show).not.toHaveBeenCalled();
    Object.assign(navigator, { share: undefined });
  });
});
