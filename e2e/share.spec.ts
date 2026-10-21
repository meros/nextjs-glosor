import { expect, test } from '@playwright/test';
import { openEdit, seed, SeedList } from './helpers';

const unicode: SeedList = {
  id: 'u',
  name: 'Åäö 日本語',
  fromLanguage: 'se',
  toLanguage: 'ja',
  items: [
    { id: '1', a: 'Sjö', b: '湖' },
    { id: '2', a: 'Hus', b: '家' },
  ],
};

test('shares a list as a link that another visitor can open', async ({ page, browser, context, baseURL }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'The share sheet replaces the clipboard on touch devices.');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await seed(page, [unicode]);
  await openEdit(page);
  await page.getByRole('button', { name: 'Fler val för listan' }).click();
  await page.getByRole('menuitem', { name: 'Dela lista' }).click();
  await expect(page.getByText('Länken är kopierad.')).toBeVisible();

  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toContain(`${baseURL}/train?share=u.`);

  const friend = await browser.newContext({ locale: 'sv-SE', launchOptions: undefined } as never);
  const friendPage = await friend.newPage();
  await friendPage.goto(link);
  await expect(friendPage).toHaveURL(/\/train$/);
  await expect(friendPage.getByText('0 av 4 rätt minst en gång')).toBeVisible();
  await expect(friendPage.getByText(/Listan "Åäö 日本語" är tillagd/)).toBeVisible();
  await friendPage.getByRole('link', { name: 'Listor' }).click();
  await expect(friendPage.getByRole('combobox', { name: 'Gloslista' })).toHaveValue('Åäö 日本語');
  await expect(friendPage.getByLabel('Ord 1, höger (japanska)')).toHaveValue('湖');
  await friend.close();
});

test('opens a link made by the old version', async ({ page }) => {
  const legacy = Buffer.from(
    JSON.stringify({ name: 'Gammal länk', fromLanguage: 'se', toLanguage: 'de', items: [{ a: 'Sjö', b: 'See' }] }),
    'latin1',
  ).toString('base64');
  await page.goto(`/train?share=${legacy}`);
  await expect(page).toHaveURL(/\/train$/);
  await expect(page.getByText('0 av 2 rätt minst en gång')).toBeVisible();
  await page.getByRole('link', { name: 'Listor' }).click();
  await expect(page.getByRole('combobox', { name: 'Gloslista' })).toHaveValue('Gammal länk');
});

test('a broken link says so and leaves the visitor on a usable page', async ({ page }) => {
  await page.goto('/train?share=trasig');
  await expect(page.getByText('Länken till listan går inte att läsa.')).toBeVisible();
  await expect(page).toHaveURL(/\/train$/);
  await expect(page.getByRole('heading', { name: 'Inget att öva på än' })).toBeVisible();
});

test('opening the same link twice does not duplicate the list', async ({ page }) => {
  const link =
    '/train?share=' +
    Buffer.from(JSON.stringify({ name: 'En gång', items: [{ a: 'a', b: 'b' }] }), 'latin1').toString('base64');
  await page.goto(link);
  await expect(page.getByText('0 av 2 rätt minst en gång')).toBeVisible();
  await page.goto(link);
  await expect(page.getByText('0 av 2 rätt minst en gång')).toBeVisible();
  await page.getByRole('link', { name: 'Listor' }).click();
  await page.getByRole('combobox', { name: 'Gloslista' }).click();
  await expect(page.getByRole('option', { name: 'En gång' })).toHaveCount(1);
});
