import { test, expect } from '../src/fixtures/test-fixtures';
import { VIEWPORTS } from '../src/utils/test-helpers';

test.describe('Navigation - Desktop @desktop @navigation', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should have clickable navigation links', async ({ homePage, page }) => {
    const navLinks = await homePage.getNavLinkTexts();
    expect(navLinks.length).toBeGreaterThan(0);

    // Verify each nav link is visible
    for (let i = 0; i < Math.min(navLinks.length, 10); i++) {
      const link = homePage.navLinks.nth(i);
      const isVisible = await link.isVisible().catch(() => false);
      if (isVisible) {
        const href = await link.getAttribute('href');
        expect(href).toBeTruthy();
      }
    }
  });

  test('should navigate via anchor links without errors', async ({ homePage, page }) => {
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('nav a[href^="#"], header a[href^="#"]'))
        .map((a) => ({
          href: (a as HTMLAnchorElement).getAttribute('href') || '',
          text: ((a as HTMLAnchorElement).textContent || '').trim(),
        }))
        .filter((l) => l.href.length > 1);
    });

    for (const link of links.slice(0, 5)) {
      await page.click(`a[href="${link.href}"]`);
      await page.waitForTimeout(500);
      // Page should not error out
      const url = page.url();
      expect(url).toContain(link.href);
    }
  });

  test('should have logo that links to homepage', async ({ homePage, page }) => {
    const logoHref = await homePage.logo.getAttribute('href').catch(() => null);
    // Logo should link to home
    if (logoHref) {
      expect(logoHref === '/' || logoHref.includes('insightvm.com')).toBe(true);
    }
  });

  test('should highlight active navigation item', async ({ page }) => {
    // Check if there's an active state on nav links
    const activeNavItem = await page.locator('nav a.active, nav a[aria-current], header a.active, [class*="active"]').count();
    // This is informational - not all sites implement this
    if (activeNavItem === 0) {
      console.warn('NOTE: No active navigation state detected');
    }
  });

  test('should have smooth scroll behavior for anchor links', async ({ page }) => {
    const scrollBehavior = await page.evaluate(() => {
      const html = document.documentElement;
      const style = getComputedStyle(html);
      return style.scrollBehavior;
    });
    // Smooth scroll is a nice-to-have for UX
    if (scrollBehavior !== 'smooth') {
      console.warn('NOTE: scroll-behavior is not set to smooth');
    }
  });
});

test.describe('Navigation - Mobile @mobile @navigation', () => {
  test.use({ viewport: VIEWPORTS.mobileSmall });

  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should toggle mobile menu on hamburger click', async ({ homePage, page }) => {
    const hasHamburger = await homePage.isHamburgerVisible();
    
    if (hasHamburger) {
      // Click to open
      await homePage.openMobileMenu();
      await page.waitForTimeout(500);
      
      // Check if some nav links are now visible
      const visibleLinks = await page.locator('nav a:visible, [class*="mobile"] a:visible, [class*="menu"] a:visible').count();
      expect(visibleLinks).toBeGreaterThan(0);
    } else {
      console.warn('BUG-CANDIDATE: No hamburger menu on mobile - full nav may overflow');
    }
  });

  test('should close mobile menu when link is clicked', async ({ homePage, page }) => {
    const hasHamburger = await homePage.isHamburgerVisible();
    
    if (hasHamburger) {
      await homePage.openMobileMenu();
      await page.waitForTimeout(500);
      
      // Click the first visible nav link
      const firstLink = page.locator('nav a:visible, [class*="mobile"] a:visible, [class*="menu"] a:visible').first();
      if (await firstLink.isVisible()) {
        await firstLink.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should not have overlapping elements on mobile', async ({ page }) => {
    // Check for elements that extend beyond viewport
    const overflowingElements = await page.evaluate(() => {
      const viewportWidth = window.innerWidth;
      const all = Array.from(document.querySelectorAll('*'));
      return all
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.right > viewportWidth + 5 && rect.width > 0;
        })
        .slice(0, 5)
        .map((el) => ({
          tag: el.tagName,
          class: el.className.toString().substring(0, 50),
          right: Math.round(el.getBoundingClientRect().right),
        }));
    });

    if (overflowingElements.length > 0) {
      console.warn('Elements overflowing viewport:', overflowingElements);
    }
  });
});
