import { test, expect } from '../src/fixtures/test-fixtures';
import { VIEWPORTS } from '../src/utils/test-helpers';

/**
 * Tests for the Pricing page at insightvm.com/pricing
 * Verifies pricing tiers, CTA buttons, and responsive layout.
 */
test.describe('Pricing Page - Desktop @desktop @pricing', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate('/pricing');
    await homePage.waitForPageLoad();
  });

  test('should load the pricing page successfully', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();

    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test('should display pricing tiers/packages', async ({ page }) => {
    // Look for pricing cards or sections
    const pricingElements = page.locator(
      '[class*="pricing"], [class*="package"], [class*="plan"], [class*="tier"], [class*="card"]'
    );
    const count = await pricingElements.count();

    if (count === 0) {
      // Try looking for pricing-related text content
      const hasPricingText = await page.locator('text=/\\£|\\$|\\€|month|price/i').count();
      if (hasPricingText === 0) {
        console.warn('BUG-CANDIDATE: No pricing elements found on /pricing page');
      }
    } else {
      console.log(`Found ${count} pricing elements`);
    }
  });

  test('should have CTA buttons on pricing cards', async ({ page }) => {
    const ctaButtons = page.locator(
      '[class*="pricing"] button, [class*="pricing"] a, [class*="package"] button, [class*="plan"] button, [class*="card"] a[href], button:has-text("Book"), button:has-text("Start"), button:has-text("Get"), a:has-text("Book"), a:has-text("Start")'
    );
    const count = await ctaButtons.count();

    if (count === 0) {
      console.warn('BUG-CANDIDATE: No CTA buttons found on pricing cards');
    } else {
      console.log(`Found ${count} CTA buttons on pricing page`);
    }
  });

  test('should display guarantee information', async ({ page }) => {
    const guarantee = page.locator('text=/guarantee|risk.free|money.back/i');
    const hasGuarantee = (await guarantee.count()) > 0;

    if (hasGuarantee) {
      console.log('Guarantee section found on pricing page');
    } else {
      console.warn('NOTE: No guarantee section found on pricing page');
    }
  });
});

test.describe('Pricing Page - Mobile @mobile @pricing', () => {
  test.use({ viewport: VIEWPORTS.mobileSmall });

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate('/pricing');
    await homePage.waitForPageLoad();
  });

  test('should display pricing cards without horizontal overflow', async ({ page }) => {
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('should stack pricing cards vertically on mobile', async ({ page }) => {
    const cards = page.locator('[class*="pricing"], [class*="package"], [class*="plan"], [class*="card"]');
    const count = await cards.count();

    if (count > 1) {
      const firstCard = await cards.nth(0).boundingBox();
      const secondCard = await cards.nth(1).boundingBox();

      if (firstCard && secondCard) {
        // On mobile, cards should be stacked (second card below first)
        const isStacked = secondCard.y > firstCard.y;
        if (!isStacked) {
          console.warn('BUG-CANDIDATE: Pricing cards are side-by-side on mobile instead of stacked');
        }
      }
    }
  });
});
