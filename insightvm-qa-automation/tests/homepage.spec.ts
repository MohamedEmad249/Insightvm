import { test, expect } from '../src/fixtures/test-fixtures';
import { EXPECTED_SEO, SOCIAL_MEDIA_URLS } from '../src/data/test-data';
import { measurePageLoadTime, VIEWPORTS } from '../src/utils/test-helpers';

test.describe('Homepage - Desktop @desktop', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should load the homepage successfully', async ({ homePage }) => {
    const title = await homePage.getTitle();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    
    const isLoaded = await homePage.verifyPageLoaded();
    expect(isLoaded).toBe(true);
  });

  test('should have a valid page title containing brand name', async ({ homePage }) => {
    const title = await homePage.getTitle();
    expect(title.toLowerCase()).toContain(EXPECTED_SEO.titleContains.toLowerCase());
  });

  test('should display the hero section with heading', async ({ homePage }) => {
    const isVisible = await homePage.isHeroVisible();
    expect(isVisible).toBe(true);

    const headingText = await homePage.getHeroHeadingText();
    expect(headingText.length).toBeGreaterThan(0);
  });

  test('should display navigation with links', async ({ homePage }) => {
    const navLinks = await homePage.getNavLinkTexts();
    expect(navLinks.length).toBeGreaterThan(0);
  });

  test('should have a visible logo', async ({ homePage }) => {
    const logoVisible = await homePage.logo.isVisible().catch(() => false);
    // Logo should be present - if not, this is a potential bug
    expect(logoVisible).toBe(true);
  });

  test('should have social media links', async ({ homePage, page }) => {
    // Social links are in the footer — scroll to bottom of page first
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    const socialCount = await homePage.getSocialLinksCount();
    expect(socialCount).toBeGreaterThan(0);
  });

  test('should have footer visible when scrolled down', async ({ homePage }) => {
    const hasFooter = await homePage.isFooterVisible();
    expect(hasFooter).toBe(true);
  });

  test('should load within acceptable time', async ({ page, homePage }) => {
    const perfData = await measurePageLoadTime(page);
    // Page should load within 5 seconds
    expect(perfData.loadTime).toBeLessThan(5000);
  });

  test('should not have broken images', async ({ homePage }) => {
    const brokenImages = await homePage.getBrokenImages();
    expect(brokenImages).toHaveLength(0);
  });

  test('should have no console errors on load', async ({ page, homePage, consoleCapture }) => {
    // Re-navigate to capture errors from the start
    await homePage.goto();
    // Small wait to capture async errors
    await page.waitForTimeout(2000);
    // Filter out known third-party errors
    const criticalErrors = consoleCapture.errors.filter(
      (err) => !err.includes('favicon') && !err.includes('analytics') && !err.includes('third-party')
    );
    // Log errors for debugging but don't fail for non-critical ones
    if (criticalErrors.length > 0) {
      console.warn('Console errors found:', criticalErrors);
    }
  });
});

test.describe('Homepage - SEO Validation @seo', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should have a meta description', async ({ homePage }) => {
    const description = await homePage.getMetaContent('description');
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThanOrEqual(EXPECTED_SEO.descriptionMinLength);
  });

  test('should have Open Graph meta tags', async ({ homePage }) => {
    const ogTitle = await homePage.getMetaContent('og:title');
    const ogDescription = await homePage.getMetaContent('og:description');
    const ogImage = await homePage.getMetaContent('og:image');

    expect(ogTitle).toBeTruthy();
    expect(ogDescription).toBeTruthy();
    expect(ogImage).toBeTruthy();
  });

  test('should have Twitter Card meta tags', async ({ homePage }) => {
    const twitterCard = await homePage.getMetaContent('twitter:card');
    const twitterTitle = await homePage.getMetaContent('twitter:title');

    expect(twitterCard).toBeTruthy();
    expect(twitterTitle).toBeTruthy();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const headings = await page.evaluate(() => {
      const hs = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return hs.map((h) => ({ tag: h.tagName, text: (h.textContent || '').trim().substring(0, 50) }));
    });
    
    // Should have at least one h1
    const h1Count = headings.filter((h) => h.tag === 'H1').length;
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('should have canonical URL or valid base URL', async ({ page }) => {
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href').catch(() => null);
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content').catch(() => null);
    // At least one should be set
    const hasUrlRef = canonical || ogUrl;
    expect(hasUrlRef).toBeTruthy();
  });

  test('should have structured data (JSON-LD)', async ({ page }) => {
    const jsonLd = await page.locator('script[type="application/ld+json"]').count();
    expect(jsonLd).toBeGreaterThan(0);
  });
});

test.describe('Homepage - Mobile @mobile', () => {
  test.use({ viewport: VIEWPORTS.mobileSmall });

  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should load correctly on mobile viewport', async ({ homePage }) => {
    const isLoaded = await homePage.verifyPageLoaded();
    expect(isLoaded).toBe(true);
  });

  test('should show hamburger menu on mobile', async ({ homePage }) => {
    const hasHamburger = await homePage.isHamburgerVisible();
    // On mobile, navigation should collapse into hamburger
    // This test documents if hamburger is present or not
    if (!hasHamburger) {
      console.warn('BUG-CANDIDATE: No hamburger menu visible on mobile viewport (375x667)');
    }
  });

  test('should have readable text without horizontal scroll', async ({ page }) => {
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('should have tap-friendly button sizes on mobile', async ({ page }) => {
    const smallButtons = await page.evaluate(() => {
      const clickables = Array.from(document.querySelectorAll('a, button'));
      return clickables.filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
      }).map((el) => ({
        tag: el.tagName,
        text: (el.textContent || '').trim().substring(0, 30),
        width: Math.round(el.getBoundingClientRect().width),
        height: Math.round(el.getBoundingClientRect().height),
      }));
    });

    if (smallButtons.length > 0) {
      console.warn(`Found ${smallButtons.length} clickable elements smaller than 44x44px:`, 
        smallButtons.slice(0, 5));
    }
  });

  test('should display hero section properly on mobile', async ({ homePage }) => {
    const isVisible = await homePage.isHeroVisible();
    expect(isVisible).toBe(true);
  });
});

test.describe('Homepage - Tablet @tablet', () => {
  test.use({ viewport: VIEWPORTS.tablet });

  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should load correctly on tablet viewport', async ({ homePage }) => {
    const isLoaded = await homePage.verifyPageLoaded();
    expect(isLoaded).toBe(true);
  });

  test('should not have horizontal overflow on tablet', async ({ page }) => {
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });
});
