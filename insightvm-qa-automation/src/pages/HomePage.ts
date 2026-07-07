import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * HomePage - Page Object for the insightvm.com landing/home page.
 * Covers hero section, navigation, services overview, and CTA elements.
 */
export class HomePage extends BasePage {
  // Navigation
  readonly nav: Locator;
  readonly navLinks: Locator;
  readonly logo: Locator;
  readonly hamburgerMenu: Locator;
  readonly mobileMenu: Locator;

  // Hero Section
  readonly heroSection: Locator;
  readonly heroHeading: Locator;
  readonly heroCta: Locator;

  // Sections
  readonly servicesSection: Locator;
  readonly portfolioSection: Locator;
  readonly aboutSection: Locator;
  readonly contactSection: Locator;
  readonly footer: Locator;

  // Social links
  readonly socialLinks: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation - using multiple fallback selectors for resilience
    this.nav = page.locator('nav, header, [role="navigation"]').first();
    this.navLinks = page.locator('nav a, header a, [role="navigation"] a');
    this.logo = page.locator('header a:first-child, nav a:first-child, [class*="logo"], img[alt*="logo" i], img[alt*="insight" i]').first();
    this.hamburgerMenu = page.locator('button[aria-label*="menu" i], [class*="hamburger"], [class*="burger"], [class*="menu-toggle"], button[class*="mobile"]').first();
    this.mobileMenu = page.locator('[class*="mobile-menu"], [class*="mobile-nav"], [class*="drawer"], [class*="sidebar"]').first();

    // Hero
    this.heroSection = page.locator('section:first-of-type, [class*="hero"], [class*="banner"], main > div:first-child').first();
    this.heroHeading = page.locator('h1, [class*="hero"] h1, [class*="hero"] h2').first();
    this.heroCta = page.locator('[class*="hero"] a, [class*="hero"] button, [class*="banner"] a, section:first-of-type a[href]').first();

    // Main sections - flexible selectors for SPA
    this.servicesSection = page.locator('[class*="service"], [id*="service"]').first();
    this.portfolioSection = page.locator('[class*="portfolio"], [class*="work"], [class*="project"], [id*="portfolio"]').first();
    this.aboutSection = page.locator('[class*="about"], [id*="about"]').first();
    this.contactSection = page.locator('[class*="contact"], [id*="contact"]').first();
    this.footer = page.locator('footer, [class*="footer"]').first();

    // Social
    this.socialLinks = page.locator('a[href*="facebook"], a[href*="instagram"], a[href*="linkedin"], a[href*="twitter"]');
  }

  /** Navigate to the homepage */
  async goto(): Promise<void> {
    await this.navigate('/');
    await this.waitForPageLoad();
  }

  /** Get all navigation link texts */
  async getNavLinkTexts(): Promise<string[]> {
    const count = await this.navLinks.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await this.navLinks.nth(i).textContent()) || '';
      if (text.trim()) texts.push(text.trim());
    }
    return texts;
  }

  /** Check if hero section is visible */
  async isHeroVisible(): Promise<boolean> {
    return await this.isElementVisible('h1, [class*="hero"], [class*="banner"]');
  }

  /** Get hero heading text */
  async getHeroHeadingText(): Promise<string> {
    return (await this.heroHeading.textContent()) || '';
  }

  /** Click the main CTA button */
  async clickHeroCta(): Promise<void> {
    await this.heroCta.click();
  }

  /** Check if mobile hamburger menu is visible (for mobile viewports) */
  async isHamburgerVisible(): Promise<boolean> {
    try {
      return await this.hamburgerMenu.isVisible();
    } catch {
      return false;
    }
  }

  /** Open mobile menu */
  async openMobileMenu(): Promise<void> {
    if (await this.isHamburgerVisible()) {
      await this.hamburgerMenu.click();
      await this.page.waitForTimeout(500); // Allow animation
    }
  }

  /** Get number of social media links */
  async getSocialLinksCount(): Promise<number> {
    return await this.socialLinks.count();
  }

  /** Check if footer is visible */
  async isFooterVisible(): Promise<boolean> {
    await this.scrollToElement('footer, [class*="footer"]');
    return await this.isElementVisible('footer, [class*="footer"]');
  }

  /** Verify the page has loaded correctly with key elements */
  async verifyPageLoaded(): Promise<boolean> {
    const hasTitle = (await this.getTitle()).length > 0;
    const hasContent = await this.page.locator('body').textContent();
    return hasTitle && (hasContent || '').length > 0;
  }
}
