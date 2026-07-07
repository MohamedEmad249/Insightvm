import { test, expect } from '../src/fixtures/test-fixtures';
import { VIEWPORTS } from '../src/utils/test-helpers';

/**
 * Visual regression tests using Playwright's built-in screenshot comparison.
 *
 * These tests capture full-page screenshots and compare them against baselines.
 * On first run, screenshots are saved as baselines.
 * On subsequent runs, they are compared to detect visual regressions.
 *
 * To update baselines: npx playwright test --update-snapshots
 */
test.describe('Visual Regression - Desktop @visual @desktop', () => {
  test('homepage should match desktop baseline', async ({ homePage, page }) => {
    await homePage.goto();
    await page.waitForTimeout(2000); // Wait for animations to settle

    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05, // Allow 5% pixel difference
      timeout: 15000,
    });
  });

  test('footer should match desktop baseline', async ({ homePage, page }) => {
    await homePage.goto();
    await homePage.scrollToElement('footer, [class*="footer"]');
    await page.waitForTimeout(1000);

    const footer = page.locator('footer, [class*="footer"]').first();
    if (await footer.isVisible()) {
      await expect(footer).toHaveScreenshot('footer-desktop.png', {
        maxDiffPixelRatio: 0.05,
      });
    }
  });
});

test.describe('Visual Regression - Mobile @visual @mobile', () => {
  test.use({ viewport: VIEWPORTS.mobileSmall });

  test('homepage should match mobile baseline', async ({ homePage, page }) => {
    await homePage.goto();
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
      timeout: 15000,
    });
  });
});

test.describe('Visual Regression - Tablet @visual @tablet', () => {
  test.use({ viewport: VIEWPORTS.tablet });

  test('homepage should match tablet baseline', async ({ homePage, page }) => {
    await homePage.goto();
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
      timeout: 15000,
    });
  });
});
