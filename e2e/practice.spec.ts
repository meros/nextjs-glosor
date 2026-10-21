import { expect, test } from '@playwright/test';
import { german, openEdit, readStorage, seed } from './helpers';

test.describe('practice', () => {
  test.beforeEach(async ({ page }) => seed(page, [german]));

  test('practises a list from start to finish of a few words', async ({ page }) => {
    await openEdit(page);
    await page.getByRole('button', { name: 'Börja öva' }).click();
    await expect(page).toHaveURL(/\/train$/);
    await expect(page.getByText('Lista: Tyska')).toBeVisible();
    await expect(page.getByText('0 av 6 rätt minst en gång')).toBeVisible();

    const answers: Record<string, string> = {
      Hus: 'Haus',
      Haus: 'Hus',
      Bil: 'Auto',
      Auto: 'Bil',
      Sjö: 'See',
      See: 'Sjö',
    };
    for (let i = 1; i <= 6; i++) {
      const word = (await page.locator('main p[lang]').first().textContent())!.trim();
      await page.getByRole('textbox', { name: /Ditt svar/ }).fill(answers[word]);
      await page.getByRole('textbox', { name: /Ditt svar/ }).press('Enter');
      await expect(page.getByRole('status')).toContainText('Rätt!');
      await page.getByRole('button', { name: 'Nästa' }).click();
    }
    await expect(page.getByText('6 av 6 rätt minst en gång')).toBeVisible();
  });

  test('a wrong answer shows the right one and waits', async ({ page }) => {
    await openEdit(page);
    await page.getByRole('button', { name: 'Börja öva' }).click();
    await page.getByRole('textbox', { name: /Ditt svar/ }).fill('fel svar');
    await page.getByRole('textbox', { name: /Ditt svar/ }).press('Enter');
    const status = page.getByRole('status');
    await expect(status).toContainText('Inte riktigt.');
    await expect(status).toContainText('Du skrev: fel svar');
    await expect(status).toContainText('Rätt svar:');
    await page.waitForTimeout(2500);
    await expect(status).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nästa' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(status).toBeHidden();
    await expect(page.getByRole('textbox', { name: /Ditt svar/ })).toBeFocused();
  });

  test('a correct answer moves on by itself', async ({ page }) => {
    await openEdit(page);
    await page.getByRole('button', { name: 'Börja öva' }).click();
    const word = (await page.locator('main p[lang]').first().textContent())!.trim();
    const answers: Record<string, string> = {
      Hus: 'Haus',
      Haus: 'Hus',
      Bil: 'Auto',
      Auto: 'Bil',
      Sjö: 'See',
      See: 'Sjö',
    };
    await page.getByRole('textbox', { name: /Ditt svar/ }).fill(answers[word]);
    await page.getByRole('textbox', { name: /Ditt svar/ }).press('Enter');
    await expect(page.getByRole('status')).toContainText('Rätt!');
    await expect(page.getByRole('status')).toBeHidden({ timeout: 4000 });
    await expect(page.getByRole('textbox', { name: /Ditt svar/ })).toHaveValue('');
  });

  test('practises one direction only', async ({ page }) => {
    await openEdit(page);
    await page.getByLabel('Riktning').getByText('🇩🇪 → 🇸🇪').click();
    await page.getByRole('button', { name: 'Börja öva' }).click();
    await expect(page.getByText('0 av 3 rätt minst en gång')).toBeVisible();
    const prompt = (await page.locator('main p[lang]').first().textContent())!.trim();
    expect(['Haus', 'Auto', 'See']).toContain(prompt);
  });

  test('case sensitivity can be switched off, and the choice is remembered', async ({ page }) => {
    await openEdit(page);
    await page.getByLabel('Riktning').getByText('🇸🇪 → 🇩🇪').click();
    await page.getByRole('button', { name: 'Börja öva' }).click();
    await page.getByRole('switch', { name: /Skiftlägeskänslig/ }).uncheck();
    await expect.poll(() => readStorage(page, 'isCaseSensitive')).toBe(false);
    const word = (await page.locator('main p[lang]').first().textContent())!.trim();
    const right: Record<string, string> = { Hus: 'haus', Bil: 'auto', Sjö: 'see' };
    await page.getByRole('textbox', { name: /Ditt svar/ }).fill(right[word]);
    await page.getByRole('textbox', { name: /Ditt svar/ }).press('Enter');
    await expect(page.getByRole('status')).toContainText('Rätt!');
    await page.reload();
    await expect(page.getByRole('switch', { name: /Skiftlägeskänslig/ })).not.toBeChecked();
  });

  test('progress survives a reload', async ({ page }) => {
    await openEdit(page);
    await page.getByRole('button', { name: 'Börja öva' }).click();
    const word = (await page.locator('main p[lang]').first().textContent())!.trim();
    const answers: Record<string, string> = {
      Hus: 'Haus',
      Haus: 'Hus',
      Bil: 'Auto',
      Auto: 'Bil',
      Sjö: 'See',
      See: 'Sjö',
    };
    await page.getByRole('textbox', { name: /Ditt svar/ }).fill(answers[word]);
    await page.getByRole('textbox', { name: /Ditt svar/ }).press('Enter');
    await expect(page.getByText('1 av 6 rätt minst en gång')).toBeVisible();
    await page.reload();
    await expect(page.getByText('1 av 6 rätt minst en gång')).toBeVisible();
  });

  test('without a started session the practice page points to the lists', async ({ page }) => {
    await page.goto('/train');
    await expect(page.getByRole('heading', { name: 'Inget att öva på än' })).toBeVisible();
    await page.getByRole('link', { name: 'Gå till listorna' }).click();
    await expect(page).toHaveURL(/\/edit$/);
  });

  test('the navigation switches between the pages and marks the current one', async ({ page }) => {
    await openEdit(page);
    await page.getByRole('button', { name: 'Börja öva' }).click();
    await expect(page.getByRole('link', { name: 'Öva', exact: true })).toHaveAttribute('aria-current', 'page');
    await page.getByRole('link', { name: 'Listor' }).click();
    await expect(page).toHaveURL(/\/edit$/);
    await expect(page.getByRole('link', { name: 'Listor' })).toHaveAttribute('aria-current', 'page');
  });
});
