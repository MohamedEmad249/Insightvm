import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage - Abstract base class for all page objects.
 * Provides common navigation, interaction, and assertion helpers.
 */
export abstract class BasePage {
  readonly page: Page;
  readonly baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = process.env.BASE_URL || 'https://www.insightvm.com';
  }

  /** Navigate to a path relative to the base URL */
  async navigate(path: string = '/'): Promise<void> {
    await this.page.goto(`${this.baseUrl}${path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
  }

  /** Get the current page URL */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /** Get the page title */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /** Wait for an element to be visible */
  async waitForElement(selector: string, timeout: number = 10000): Promise<Locator> {
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: 'visible', timeout });
    return locator;
  }

  /** Click an element with retry logic */
  async clickElement(selector: string): Promise<void> {
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    await locator.click();
  }

  /** Type text into an input field */
  async fillInput(selector: string, text: string): Promise<void> {
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    await locator.clear();
    await locator.fill(text);
  }

  /** Check if an element is visible */
  async isElementVisible(selector: string, timeout: number = 5000): Promise<boolean> {
    try {
      await this.page.locator(selector).first().waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /** Get text content from an element */
  async getElementText(selector: string): Promise<string> {
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    return (await locator.textContent()) || '';
  }

  /** Scroll to an element */
  async scrollToElement(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /** Take a screenshot with a descriptive name */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  /** Wait for page to fully load */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
      // networkidle can be flaky; fall back to domcontentloaded
    });
  }

  /** Check for console errors on the page */
  async getConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    return errors;
  }

  /** Verify meta tag content (uses .first() to handle duplicate meta tags) */
  async getMetaContent(name: string): Promise<string | null> {
    const meta = this.page.locator(`meta[name='${name}'], meta[property='${name}']`).first();
    try {
      return await meta.getAttribute('content');
    } catch {
      return null;
    }
  }

  /** Check if page has broken images */
  async getBrokenImages(): Promise<string[]> {
    const brokenImages = await this.page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.src);
    });
    return brokenImages;
  }

  /** Get all links on the page */
  async getAllLinks(): Promise<{ href: string; text: string }[]> {
    return await this.page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors.map((a) => ({
        href: a.href,
        text: (a.textContent || '').trim(),
      }));
    });
  }
}
