import { expect, test } from '@playwright/test';

test('the start page sends the visitor to the lists, in Swedish', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));

  await page.goto('/');
  await expect(page).toHaveURL(/\/edit$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'sv');
  await expect(page).toHaveTitle(/Glosorna/);
  await expect(page.getByRole('heading', { level: 1, name: 'Dina glosor' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('a first-time visitor sees the sample lists', async ({ page }) => {
  await page.goto('/edit');
  await expect(page.getByRole('combobox', { name: 'Gloslista' })).toHaveValue('Easy German');
  await page.getByRole('combobox', { name: 'Gloslista' }).click();
  await expect(page.getByRole('option')).toHaveText([
    'Easy German',
    'Medium English',
    'Svenska bokstaveringsalfabetet',
  ]);
});

test('the web app manifest and icons are served', async ({ request }) => {
  const response = await request.get('/manifest.webmanifest');
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  expect(manifest).toMatchObject({ name: 'Glosorna', lang: 'sv', display: 'standalone', start_url: '/edit' });
  for (const icon of manifest.icons) {
    expect((await request.get(icon.src)).ok()).toBe(true);
  }
});

test('an unknown address shows a friendly page with a way back', async ({ page }) => {
  const response = await page.goto('/finns-inte');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Sidan finns inte' })).toBeVisible();
  await page.getByRole('link', { name: 'Till startsidan' }).click();
  await expect(page).toHaveURL(/\/edit$/);
});

test('the skip link jumps to the content', async ({ page }) => {
  await page.goto('/edit');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Hoppa till innehållet' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
});
