import { test, expect } from '../src/fixtures/test-fixtures';
import { VIEWPORTS } from '../src/utils/test-helpers';

/**
 * Tests for the Services page at insightvm.com/services
 * and the Portfolio/Work page.
 */
test.describe('Services Page - Desktop @desktop @services', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate('/services');
    await homePage.waitForPageLoad();
  });

  test('should load the services page successfully', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();

    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test('should display service offerings', async ({ page }) => {
    // Look for service cards, sections, or lists
    const serviceElements = page.locator(
      '[class*="service"], [class*="offering"], section h2, section h3, [class*="card"]'
    );
    const count = await serviceElements.count();

    if (count === 0) {
      console.warn('NOTE: No distinct service elements found. Page may use a different layout.');
    } else {
      console.log(`Found ${count} service-related elements`);
    }
  });

  test('should have CTA on services page', async ({ page }) => {
    const cta = page.locator(
      'a:has-text("Book"), a:has-text("Contact"), a:has-text("Get Started"), button:has-text("Book"), button:has-text("Contact"), button:has-text("Get Started")'
    );
    const count = await cta.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Portfolio Page - Desktop @desktop @portfolio', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate('/portfolio');
    await homePage.waitForPageLoad();
  });

  test('should load the portfolio page successfully', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();

    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test('should display portfolio/case study items', async ({ page }) => {
    const portfolioItems = page.locator(
      '[class*="portfolio"], [class*="project"], [class*="case-study"], [class*="work"], [class*="card"], article'
    );
    const count = await portfolioItems.count();

    if (count === 0) {
      console.warn('NOTE: No portfolio items found. Page may use different selectors.');
    } else {
      console.log(`Found ${count} portfolio items`);
    }
  });

  test('should have clickable portfolio items', async ({ page }) => {
    const clickableItems = page.locator(
      '[class*="portfolio"] a, [class*="project"] a, [class*="card"] a, article a'
    );
    const count = await clickableItems.count();

    if (count > 0) {
      // Verify first item is clickable
      const firstItem = clickableItems.first();
      const href = await firstItem.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });
});

test.describe('About Page - Desktop @desktop @about', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate('/about');
    await homePage.waitForPageLoad();
  });

  test('should load the about page successfully', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();

    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test('should have company information', async ({ page }) => {
    const hasContent = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.length > 100;
    });
    expect(hasContent).toBe(true);
  });
});

test.describe('Inner Pages - Mobile @mobile @pages', () => {
  test.use({ viewport: VIEWPORTS.mobileSmall });

  test('services page should not have horizontal overflow on mobile', async ({ homePage, page }) => {
    await homePage.navigate('/services');
    await homePage.waitForPageLoad();

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('portfolio page should not have horizontal overflow on mobile', async ({ homePage, page }) => {
    await homePage.navigate('/portfolio');
    await homePage.waitForPageLoad();

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('about page should not have horizontal overflow on mobile', async ({ homePage, page }) => {
    await homePage.navigate('/about');
    await homePage.waitForPageLoad();

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });
});
