import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Runs on a desktop screen and on a phone screen (see playwright.config.js).
test.describe('catalog', () => {
  test('shows every product and filters by aisle', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'All products' })).toBeVisible();
    await expect(page.getByText('896 products')).toBeVisible();

    await page.getByRole('button', { name: 'Frozen', exact: true }).click();
    await expect(page.getByText('44 products')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Frozen', exact: true })).toHaveAttribute('aria-pressed', 'true');
  });

  test('has no accessibility violation found by axe-core (WCAG 2.2 AA)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('896 products')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  test('fits a phone screen without sideways scrolling', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'phone only');
    await page.goto('/');
    await expect(page.getByText('896 products')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
