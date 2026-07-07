import { Page, BrowserContext, expect } from '@playwright/test';

/**
 * Viewport configurations for responsive testing.
 */
export const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  laptop: { width: 1366, height: 768 },
  tablet: { width: 768, height: 1024 },
  mobileLarge: { width: 414, height: 896 },  // iPhone 11 Pro Max
  mobileSmall: { width: 375, height: 667 },  // iPhone SE
} as const;

/**
 * Performance metrics thresholds.
 */
export const PERFORMANCE_THRESHOLDS = {
  maxLoadTimeMs: 5000,
  maxLCP: 2500,       // Largest Contentful Paint
  maxFID: 100,        // First Input Delay
  maxCLS: 0.1,        // Cumulative Layout Shift
} as const;

/**
 * Check for broken links on a page.
 * Returns an array of broken link URLs with their status codes.
 */
export async function checkBrokenLinks(
  page: Page,
  baseUrl: string
): Promise<{ url: string; status: number; text: string }[]> {
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href]'))
      .map((a) => ({
        href: (a as HTMLAnchorElement).href,
        text: ((a as HTMLAnchorElement).textContent || '').trim(),
      }))
      .filter((link) => link.href.startsWith('http'));
  });

  const brokenLinks: { url: string; status: number; text: string }[] = [];

  for (const link of links) {
    try {
      const response = await page.request.get(link.href, { timeout: 10000 });
      if (response.status() >= 400) {
        brokenLinks.push({
          url: link.href,
          status: response.status(),
          text: link.text,
        });
      }
    } catch {
      brokenLinks.push({
        url: link.href,
        status: 0,
        text: link.text,
      });
    }
  }

  return brokenLinks;
}

/**
 * Measure page load performance.
 */
export async function measurePageLoadTime(page: Page): Promise<{
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
}> {
  const perfData = await page.evaluate(() => {
    const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find((e) => e.name === 'first-contentful-paint');

    return {
      loadTime: timing ? timing.loadEventEnd - timing.startTime : 0,
      domContentLoaded: timing ? timing.domContentLoadedEventEnd - timing.startTime : 0,
      firstPaint: firstPaint ? firstPaint.startTime : 0,
    };
  });

  return perfData;
}

/**
 * Check page accessibility basics (non-exhaustive, key checks only).
 */
export async function checkBasicAccessibility(page: Page): Promise<{
  hasLangAttribute: boolean;
  hasViewportMeta: boolean;
  imagesWithoutAlt: string[];
  headingOrder: string[];
  formInputsWithoutLabels: number;
}> {
  return await page.evaluate(() => {
    const html = document.documentElement;
    const hasLangAttribute = !!html.getAttribute('lang');
    const hasViewportMeta = !!document.querySelector('meta[name="viewport"]');

    const imagesWithoutAlt = Array.from(document.querySelectorAll('img'))
      .filter((img) => !img.getAttribute('alt'))
      .map((img) => img.src);

    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const headingOrder = headings.map((h) => h.tagName.toLowerCase());

    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    const formInputsWithoutLabels = inputs.filter((input) => {
      const id = input.getAttribute('id');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      const label = id ? document.querySelector(`label[for="${id}"]`) : null;
      const parentLabel = input.closest('label');
      return !label && !parentLabel && !ariaLabel && !ariaLabelledBy;
    }).length;

    return {
      hasLangAttribute,
      hasViewportMeta,
      imagesWithoutAlt,
      headingOrder,
      formInputsWithoutLabels,
    };
  });
}

/**
 * Capture console errors during a test.
 */
export function setupConsoleErrorCapture(page: Page): { errors: string[]; warnings: string[] } {
  const capture = { errors: [] as string[], warnings: [] as string[] };

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      capture.errors.push(msg.text());
    } else if (msg.type() === 'warning') {
      capture.warnings.push(msg.text());
    }
  });

  return capture;
}

/**
 * Check if an external resource (CSS/JS/image) loads successfully.
 */
export async function checkResourceLoading(
  page: Page
): Promise<{ failed: string[]; slow: string[] }> {
  const failedResources: string[] = [];
  const slowResources: string[] = [];

  page.on('requestfailed', (request) => {
    failedResources.push(request.url());
  });

  page.on('requestfinished', (request) => {
    const timing = request.timing();
    if (timing.responseEnd > 3000) {
      slowResources.push(request.url());
    }
  });

  return { failed: failedResources, slow: slowResources };
}
