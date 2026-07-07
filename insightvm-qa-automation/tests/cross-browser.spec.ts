import { test, expect } from '../src/fixtures/test-fixtures';
import { VIEWPORTS } from '../src/utils/test-helpers';

/**
 * Cross-browser compatibility tests.
 * These tests run on all configured browsers (Chromium, Firefox, WebKit)
 * via Playwright's project configuration.
 */
test.describe('Cross-Browser Compatibility @cross-browser', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should render homepage consistently', async ({ homePage, page }) => {
    const isLoaded = await homePage.verifyPageLoaded();
    expect(isLoaded).toBe(true);

    // Check key elements are present
    const title = await homePage.getTitle();
    expect(title).toBeTruthy();

    // Check body has content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test('should render fonts correctly', async ({ page }) => {
    const fontIssues = await page.evaluate(() => {
      const body = document.body;
      const style = getComputedStyle(body);
      return {
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
      };
    });

    expect(fontIssues.fontFamily).toBeTruthy();
    expect(fontIssues.fontSize).toBeTruthy();
    console.log('Font rendering:', fontIssues);
  });

  test('should have working CSS animations/transitions', async ({ page }) => {
    const hasAnimations = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('*'));
      return allElements.some((el) => {
        const style = getComputedStyle(el);
        return (
          (style.animationName && style.animationName !== 'none') ||
          (style.transition && style.transition !== 'all 0s ease 0s' && style.transition !== 'none')
        );
      });
    });

    console.log(`Page uses CSS animations/transitions: ${hasAnimations}`);
  });

  test('should display images correctly', async ({ page }) => {
    await page.waitForTimeout(2000); // Wait for images to load
    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs
        .filter((img) => img.src && (!img.complete || img.naturalWidth === 0))
        .map((img) => img.src);
    });

    if (brokenImages.length > 0) {
      console.warn('Broken images found:', brokenImages);
    }
    expect(brokenImages).toHaveLength(0);
  });

  test('should handle scroll events correctly', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBe(0);
  });
});
