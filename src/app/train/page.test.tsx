import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTO_ADVANCE_MS } from '@/components/PracticeView';
import { encodeShare } from '@/lib/share';
import { navigationState, renderApp, routerMock } from '@/test/render';
import TrainPage from './page';

const card = (id: string, from: string, to: string, extra = {}) => ({
  id,
  from,
  to,
  fromLanguage: 'se',
  toLanguage: 'de',
  correct: 0,
  total: 0,
  ...extra,
});

const saved = {
  trainingItems: [card('1', 'Hus', 'Haus')],
  trainingTitle: 'Tyska',
  isCaseSensitive: true,
};

beforeEach(() => {
  navigationState.search = '';
  routerMock.replace.mockClear();
});
afterEach(() => vi.useRealTimers());

describe('TrainPage', () => {
  it('points to the lists when there is nothing to practice', async () => {
    renderApp(<TrainPage />);
    expect(await screen.findByRole('heading', { name: 'Inget att öva på än' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gå till listorna' })).toHaveAttribute('href', '/edit');
  });

  it('shows the word, the languages, the list name and the progress', async () => {
    renderApp(<TrainPage />, saved);
    expect(await screen.findByText('Hus')).toBeInTheDocument();
    expect(screen.getByText(/Svenska → .*Tyska/)).toBeInTheDocument();
    expect(screen.getByText('Lista: Tyska')).toBeInTheDocument();
    expect(screen.getByText('0 av 1 rätt minst en gång')).toBeInTheDocument();
  });

  it('puts the cursor in the answer field with phone-friendly attributes', async () => {
    renderApp(<TrainPage />, saved);
    const field = await screen.findByRole('textbox', { name: 'Ditt svar (tyska)' });
    expect(field).toHaveFocus();
    expect(field).toHaveAttribute('autocapitalize', 'none');
    expect(field).toHaveAttribute('autocorrect', 'off');
    expect(field).toHaveAttribute('spellcheck', 'false');
    expect(field).toHaveAttribute('lang', 'de');
  });

  it('accepts a correct answer typed with Enter and saves the score', async () => {
    renderApp(<TrainPage />, saved);
    await userEvent.type(await screen.findByRole('textbox', { name: /Ditt svar/ }), 'Haus{Enter}');
    expect(await screen.findByRole('status')).toHaveTextContent('Rätt!');
    await waitFor(() =>
      expect(JSON.parse(window.localStorage.getItem('trainingItems')!)[0]).toMatchObject({ correct: 1, total: 1 }),
    );
  });

  it('moves on by itself after a correct answer', async () => {
    renderApp(<TrainPage />, saved);
    const field = await screen.findByRole('textbox', { name: /Ditt svar/ });
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await userEvent.setup({ advanceTimers: vi.advanceTimersByTime }).type(field, 'Haus{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('Rätt!');
    act(() => {
      vi.advanceTimersByTime(AUTO_ADVANCE_MS + 50);
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Ditt svar/ })).toHaveValue('');
  });

  it('keeps a wrong answer on screen until the user continues, and shows both answers', async () => {
    renderApp(<TrainPage />, saved);
    await userEvent.type(await screen.findByRole('textbox', { name: /Ditt svar/ }), 'Hauss{Enter}');
    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent('Inte riktigt.');
    expect(status).toHaveTextContent('Du skrev: Hauss');
    expect(status).toHaveTextContent('Rätt svar: Haus');
    const next = screen.getByRole('button', { name: 'Nästa' });
    expect(next).toHaveFocus();
    vi.useFakeTimers();
    act(() => {
      vi.advanceTimersByTime(AUTO_ADVANCE_MS * 4);
    });
    expect(screen.getByRole('status')).toBeInTheDocument();
    vi.useRealTimers();
    await userEvent.click(next);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('says so when the answer was left empty', async () => {
    renderApp(<TrainPage />, saved);
    await userEvent.click(await screen.findByRole('button', { name: 'Kontrollera' }));
    expect(await screen.findByRole('status')).toHaveTextContent('(inget svar)');
  });

  it('Enter on the Next button moves to the next word', async () => {
    renderApp(<TrainPage />, saved);
    await userEvent.type(await screen.findByRole('textbox', { name: /Ditt svar/ }), 'fel{Enter}');
    await screen.findByRole('status');
    await userEvent.keyboard('{Enter}');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('respects the case setting and remembers it', async () => {
    renderApp(<TrainPage />, saved);
    await userEvent.click(await screen.findByRole('switch', { name: /Skiftlägeskänslig/ }));
    await userEvent.type(screen.getByRole('textbox', { name: /Ditt svar/ }), 'haus{Enter}');
    expect(await screen.findByRole('status')).toHaveTextContent('Rätt!');
    await waitFor(() => expect(window.localStorage.getItem('isCaseSensitive')).toBe('false'));
  });

  it('is case sensitive by default', async () => {
    renderApp(<TrainPage />, saved);
    await userEvent.type(await screen.findByRole('textbox', { name: /Ditt svar/ }), 'haus{Enter}');
    expect(await screen.findByRole('status')).toHaveTextContent('Inte riktigt.');
  });

  it('keeps å ä ö when answering', async () => {
    renderApp(<TrainPage />, { ...saved, trainingItems: [card('1', 'sjö', 'See Åäö')] });
    await userEvent.type(await screen.findByRole('textbox', { name: /Ditt svar/ }), 'See Åäö{Enter}');
    expect(await screen.findByRole('status')).toHaveTextContent('Rätt!');
  });

  it('picks the word answered correctly the fewest times', async () => {
    renderApp(<TrainPage />, {
      ...saved,
      trainingItems: [card('1', 'Hus', 'Haus', { correct: 3 }), card('2', 'Bil', 'Auto', { correct: 0 })],
    });
    expect(await screen.findByText('Bil')).toBeInTheDocument();
  });

  it('reads progress saved by the old version', async () => {
    renderApp(<TrainPage />, {
      trainingItems: [
        { from: 'Hund', to: 'Dog', correct: 1, total: 2, lastReviewed: 5, fromLanguage: 'se', toLanguage: 'en' },
      ],
    });
    expect(await screen.findByText('Hund')).toBeInTheDocument();
    expect(screen.getByText('1 av 1 rätt minst en gång')).toBeInTheDocument();
  });

  describe('shared link', () => {
    const shared = {
      id: 'x',
      name: 'Delad',
      fromLanguage: 'se',
      toLanguage: 'de',
      items: [{ id: '1', a: 'Sjö', b: 'See' }],
    };

    it('imports the list, starts practice and removes the parameter from the address', async () => {
      navigationState.search = `share=${encodeShare(shared)}`;
      renderApp(<TrainPage />);
      expect(await screen.findByText(/^(Sjö|See)$/)).toBeInTheDocument();
      expect(routerMock.replace).toHaveBeenCalledWith('/train');
      await waitFor(() => {
        const lists = JSON.parse(window.localStorage.getItem('glossaries')!) as { name: string }[];
        expect(lists.map((l) => l.name)).toContain('Delad');
      });
      expect(JSON.parse(window.localStorage.getItem('trainingItems')!)).toHaveLength(2);
    });

    it('does not overwrite the visitor’s own lists', async () => {
      navigationState.search = `share=${encodeShare(shared)}`;
      renderApp(<TrainPage />, {
        glossaries: [{ id: 'mine', name: 'Min', fromLanguage: 'se', toLanguage: 'en', items: [] }],
      });
      await screen.findByText(/^(Sjö|See)$/);
      await waitFor(() => {
        const lists = JSON.parse(window.localStorage.getItem('glossaries')!) as { name: string }[];
        expect(lists.map((l) => l.name)).toEqual(['Min', 'Delad']);
      });
    });

    it('tells the user when the link cannot be read, and still cleans the address', async () => {
      navigationState.search = 'share=garbage';
      renderApp(<TrainPage />);
      await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/train'));
      expect(await screen.findByRole('heading', { name: 'Inget att öva på än' })).toBeInTheDocument();
    });
  });
});
