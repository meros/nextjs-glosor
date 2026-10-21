import { expect, test } from '@playwright/test';
import { addWord, german, openEdit, readStorage, seed } from './helpers';

test.describe('lists and words', () => {
  test.beforeEach(async ({ page }) => seed(page, [german]));

  test('shows the words of the list', async ({ page }) => {
    await openEdit(page);
    await expect(page.getByLabel('Ord 1, vänster (svenska)')).toHaveValue('Hus');
    await expect(page.getByLabel('Ord 3, höger (tyska)')).toHaveValue('See');
    await expect(page.getByText('3 ord', { exact: true })).toBeVisible();
  });

  test('adds a word with Enter, keeps å ä ö, and the field is ready for the next one', async ({ page }) => {
    await openEdit(page);
    await addWord(page, 'Älg', 'Elch');
    await expect(page.getByLabel('Ord 4, vänster (svenska)')).toHaveValue('Älg');
    await expect(page.getByLabel('Nytt ord på svenska')).toBeFocused();
    await expect(page.getByLabel('Nytt ord på svenska')).toHaveValue('');
  });

  test('keeps the words after a reload', async ({ page }) => {
    await openEdit(page);
    await addWord(page, 'Fågel', 'Vogel');
    await page.reload();
    await expect(page.getByLabel('Ord 4, vänster (svenska)')).toHaveValue('Fågel');
    expect(await readStorage<{ items: unknown[] }[]>(page, 'glossaries')).toHaveLength(1);
  });

  test('edits and deletes a word', async ({ page }) => {
    await openEdit(page);
    await page.getByLabel('Ord 2, höger (tyska)').fill('Wagen');
    await page.getByRole('button', { name: 'Ta bort ordpar 1' }).click();
    await expect(page.getByLabel('Ord 1, höger (tyska)')).toHaveValue('Wagen');
    await expect(page.getByText('2 ord', { exact: true })).toBeVisible();
  });

  test('does not add half a pair', async ({ page }) => {
    await openEdit(page);
    await page.getByLabel('Nytt ord på svenska').fill('Bara');
    await page.getByLabel('Nytt ord på svenska').press('Enter');
    await expect(page.getByLabel('Nytt ord på tyska')).toBeFocused();
    await expect(page.getByText('3 ord', { exact: true })).toBeVisible();
  });

  test('creates, renames and deletes a list', async ({ page }) => {
    await openEdit(page);

    await page.getByRole('button', { name: 'Ny lista' }).click();
    await page.getByRole('textbox', { name: 'Namn på listan' }).fill('Franska');
    await page.getByRole('textbox', { name: 'Namn på listan' }).press('Enter');
    await expect(page.getByRole('combobox', { name: 'Gloslista' })).toHaveValue('Franska');
    await expect(page.getByText(/Listan är tom/)).toBeVisible();

    await page.getByRole('button', { name: 'Fler val för listan' }).click();
    await page.getByRole('menuitem', { name: 'Byt namn' }).click();
    await page.getByRole('textbox', { name: 'Namn på listan' }).fill('Franska v.12');
    await page.getByRole('button', { name: 'Spara' }).click();
    await expect(page.getByRole('combobox', { name: 'Gloslista' })).toHaveValue('Franska v.12');

    await page.getByRole('button', { name: 'Fler val för listan' }).click();
    await page.getByRole('menuitem', { name: 'Ta bort lista' }).click();
    await expect(page.getByRole('dialog')).toContainText('Franska v.12');
    await page.getByRole('button', { name: 'Ta bort', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Gloslista' })).toHaveValue('Tyska');
  });

  test('changing the language is saved', async ({ page }) => {
    await openEdit(page);
    await page.getByRole('combobox', { name: 'Till språk' }).click();
    await page.getByRole('option', { name: /Franska/ }).click();
    await page.reload();
    await expect(page.getByRole('combobox', { name: 'Till språk' })).toHaveValue('🇫🇷 Franska');
  });

  test('deleting every list shows an inviting empty state', async ({ page }) => {
    await openEdit(page);
    await page.getByRole('button', { name: 'Fler val för listan' }).click();
    await page.getByRole('menuitem', { name: 'Ta bort lista' }).click();
    await page.getByRole('button', { name: 'Ta bort', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Du har inga listor än' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Du har inga listor än' })).toBeVisible();
    await page.getByRole('button', { name: 'Ny lista' }).click();
    await page.getByRole('textbox', { name: 'Namn på listan' }).fill('Ny');
    await page.getByRole('button', { name: 'Skapa lista' }).click();
    await expect(page.getByRole('combobox', { name: 'Gloslista' })).toHaveValue('Ny');
  });

  test('the dialog can be closed with Escape and does not trap the user', async ({ page }) => {
    await openEdit(page);
    await page.getByRole('button', { name: 'Ny lista' }).click();
    await expect(page.getByRole('textbox', { name: 'Namn på listan' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Ny lista' })).toBeFocused();
  });
});
