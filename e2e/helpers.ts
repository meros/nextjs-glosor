import { expect, Page } from '@playwright/test';

export interface SeedList {
  id: string;
  name: string;
  fromLanguage: string;
  toLanguage: string;
  items: { id: string; a: string; b: string }[];
}

export const german: SeedList = {
  id: 'de',
  name: 'Tyska',
  fromLanguage: 'se',
  toLanguage: 'de',
  items: [
    { id: '1', a: 'Hus', b: 'Haus' },
    { id: '2', a: 'Bil', b: 'Auto' },
    { id: '3', a: 'Sjö', b: 'See' },
  ],
};

/** Saves lists before the first page load only, so a reload keeps what the app saved itself. */
export async function seed(page: Page, glossaries: SeedList[], extra: Record<string, unknown> = {}) {
  await page.addInitScript(
    ([lists, other]) => {
      if (window.sessionStorage.getItem('seeded')) return;
      window.sessionStorage.setItem('seeded', '1');
      window.localStorage.setItem('glossaries', JSON.stringify(lists));
      for (const [key, value] of Object.entries(other as Record<string, unknown>)) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    },
    [glossaries, extra] as const,
  );
}

export async function openEdit(page: Page) {
  await page.goto('/edit');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

export async function addWord(page: Page, from: string, to: string) {
  await page
    .getByLabel(/^Nytt ord på/)
    .first()
    .fill(from);
  await page
    .getByLabel(/^Nytt ord på/)
    .nth(1)
    .fill(to);
  await page
    .getByLabel(/^Nytt ord på/)
    .nth(1)
    .press('Enter');
}

export async function readStorage<T>(page: Page, key: string): Promise<T> {
  return page.evaluate((k) => JSON.parse(window.localStorage.getItem(k) ?? 'null'), key);
}
