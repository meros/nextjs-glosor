import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test } from '@playwright/test';
import { german, openEdit, seed } from './helpers';

const schemes = ['light', 'dark'] as const;

/** `skip` names rules that report a known Mantine quirk, not a defect in this app. Each use says which. */
async function expectNoViolations(page: Page, skip: string[] = []) {
  const results = await new AxeBuilder({ page })
    .disableRules(skip)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
}

for (const scheme of schemes) {
  test.describe(`accessibility, ${scheme} mode`, () => {
    test.use({ colorScheme: scheme });
    test.beforeEach(async ({ page }) => seed(page, [german]));

    test('lists page', async ({ page }) => {
      await openEdit(page);
      await expectNoViolations(page);
    });

    test('lists page with the list menu open', async ({ page }) => {
      await openEdit(page);
      await page.getByRole('button', { name: 'Fler val för listan' }).click();
      await expect(page.getByRole('menu')).toBeVisible();
      // The menu is portaled outside any landmark and Mantine adds focus-guard nodes inside the menu role.
      await expectNoViolations(page, ['region', 'aria-required-children']);
    });

    test('new-list dialog', async ({ page }) => {
      await openEdit(page);
      await page.getByRole('button', { name: 'Ny lista' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      // Mantine renders the dialog title in a <header>, which axe counts as a second page banner.
      await expectNoViolations(page, ['landmark-no-duplicate-banner', 'landmark-unique']);
    });

    test('practice page, asking and after an answer', async ({ page }) => {
      await openEdit(page);
      await page.getByRole('button', { name: 'Börja öva' }).click();
      await expect(page.getByRole('textbox', { name: /Ditt svar/ })).toBeVisible();
      await expectNoViolations(page);
      await page.getByRole('textbox', { name: /Ditt svar/ }).fill('fel');
      await page.getByRole('textbox', { name: /Ditt svar/ }).press('Enter');
      await expect(page.getByRole('status')).toContainText('Inte riktigt.');
      await expectNoViolations(page);
    });

    test('empty states', async ({ page }) => {
      await page.goto('/train');
      await expect(page.getByRole('heading', { name: 'Inget att öva på än' })).toBeVisible();
      await expectNoViolations(page);
      await page.goto('/finns-inte');
      await expectNoViolations(page);
    });
  });
}

test.describe('layout', () => {
  test.beforeEach(async ({ page }) => seed(page, [german]));

  for (const width of [320, 360, 768, 1280]) {
    test(`no horizontal scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      for (const path of ['/edit', '/train']) {
        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test('inputs use at least 16px text so iOS does not zoom', async ({ page }) => {
    await openEdit(page);
    const sizes = await page
      .locator('input')
      .evaluateAll((inputs) => inputs.map((input) => parseFloat(getComputedStyle(input).fontSize)));
    expect(sizes.length).toBeGreaterThan(3);
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(16);
  });

  test('the main controls are at least 44px tall and every control at least 24px (WCAG 2.2 AA)', async ({ page }) => {
    await openEdit(page);
    for (const control of [
      page.getByRole('button', { name: 'Börja öva' }),
      page.getByRole('button', { name: 'Lägg till ordpar' }),
      page.getByRole('button', { name: 'Ta bort ordpar 1' }),
      page.getByRole('button', { name: 'Fler val för listan' }),
      page.getByRole('link', { name: 'Listor' }),
      page.getByRole('link', { name: 'Öva', exact: true }),
    ]) {
      const box = (await control.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(40);
      expect(box.width).toBeGreaterThanOrEqual(40);
    }
    const all = await page.locator('button, a, input, [role="combobox"]').evaluateAll((elements) =>
      elements
        .map((element) => ({
          name: element.getAttribute('aria-label') ?? element.textContent,
          ...element.getBoundingClientRect().toJSON(),
        }))
        .filter((box) => box.width > 0 && (box.width < 24 || box.height < 24)),
    );
    expect(all).toEqual([]);
  });

  test('the start button is visible without scrolling, even for a long list', async ({ page }) => {
    const long = {
      ...german,
      items: Array.from({ length: 40 }, (_, i) => ({ id: `${i}`, a: `ord ${i}`, b: `Wort ${i}` })),
    };
    await page.addInitScript((list) => {
      window.localStorage.setItem('glossaries', JSON.stringify([list]));
    }, long);
    await page.goto('/edit');
    await expect(page.getByLabel('Ord 40, vänster (svenska)')).toBeAttached();
    await expect(page.getByRole('button', { name: 'Börja öva' })).toBeInViewport();
  });

  test('the layout stays usable when the text is zoomed to 200%', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 800 });
    await page.goto('/edit');
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('works with reduced motion and a keyboard only', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openEdit(page);
    await page.getByRole('button', { name: 'Börja öva' }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/train$/);
    await expect(page.getByRole('textbox', { name: /Ditt svar/ })).toBeFocused();
  });
});

test.describe('screenshots for review', () => {
  for (const scheme of schemes) {
    test(`pages in ${scheme} mode`, async ({ page }, testInfo) => {
      await page.emulateMedia({ colorScheme: scheme });
      await seed(page, [german]);
      await openEdit(page);
      await page.screenshot({ path: `test-results/shots/${testInfo.project.name}-${scheme}-edit.png`, fullPage: true });
      await page.getByRole('button', { name: 'Börja öva' }).click();
      await expect(page.getByRole('textbox', { name: /Ditt svar/ })).toBeVisible();
      await page.screenshot({
        path: `test-results/shots/${testInfo.project.name}-${scheme}-train.png`,
        fullPage: true,
      });
      await page.getByRole('textbox', { name: /Ditt svar/ }).fill('fel');
      await page.getByRole('textbox', { name: /Ditt svar/ }).press('Enter');
      await expect(page.getByRole('status')).toBeVisible();
      await page.screenshot({
        path: `test-results/shots/${testInfo.project.name}-${scheme}-wrong.png`,
        fullPage: true,
      });
    });
  }
});
