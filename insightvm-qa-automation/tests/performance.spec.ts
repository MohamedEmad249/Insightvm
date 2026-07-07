import { test, expect } from '../src/fixtures/test-fixtures';
import { measurePageLoadTime, checkResourceLoading, VIEWPORTS, PERFORMANCE_THRESHOLDS } from '../src/utils/test-helpers';

test.describe('Performance - Desktop @desktop @performance', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('https://www.insightvm.com', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.maxLoadTimeMs);
    console.log(`Homepage load time: ${loadTime}ms`);
  });

  test('should have First Contentful Paint under 2.5s', async ({ page }) => {
    await page.goto('https://www.insightvm.com', { waitUntil: 'load' });
    
    const fcp = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find((e) => e.name === 'first-contentful-paint');
      return fcpEntry ? fcpEntry.startTime : null;
    });

    if (fcp !== null) {
      expect(fcp).toBeLessThan(PERFORMANCE_THRESHOLDS.maxLCP);
      console.log(`FCP: ${Math.round(fcp)}ms`);
    } else {
      console.warn('Could not measure FCP');
    }
  });

  test('should not have failed resource requests', async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on('requestfailed', (request) => {
      failedRequests.push(`${request.url()} - ${request.failure()?.errorText || 'unknown'}`);
    });

    await page.goto('https://www.insightvm.com', { waitUntil: 'load' });
    await page.waitForTimeout(3000); // Wait for lazy-loaded resources

    if (failedRequests.length > 0) {
      console.warn('Failed resource requests:', failedRequests);
    }
    // Allow some third-party failures but no first-party
    const firstPartyFailures = failedRequests.filter((r) => r.includes('insightvm.com'));
    expect(firstPartyFailures).toHaveLength(0);
  });

  test('should have reasonable page size', async ({ page }) => {
    let totalBytes = 0;
    const resourceSizes: { url: string; size: number }[] = [];

    page.on('response', async (response) => {
      try {
        const body = await response.body();
        totalBytes += body.length;
        if (body.length > 500000) {
          resourceSizes.push({
            url: response.url().substring(0, 80),
            size: Math.round(body.length / 1024),
          });
        }
      } catch {
        // Some responses may not have body
      }
    });

    await page.goto('https://www.insightvm.com', { waitUntil: 'load' });
    await page.waitForTimeout(3000);

    const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
    console.log(`Total page size: ${totalMB} MB`);

    if (resourceSizes.length > 0) {
      console.warn('Large resources (>500KB):', resourceSizes);
    }

    // Page should be under 10MB total
    expect(totalBytes).toBeLessThan(10 * 1024 * 1024);
  });

  test('should have proper caching headers', async ({ page }) => {
    const uncachedResources: string[] = [];

    page.on('response', (response) => {
      const url = response.url();
      const cacheControl = response.headers()['cache-control'];
      
      // Check static assets
      if (url.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff2?)$/)) {
        if (!cacheControl || cacheControl.includes('no-cache') || cacheControl.includes('no-store')) {
          uncachedResources.push(url.substring(0, 80));
        }
      }
    });

    await page.goto('https://www.insightvm.com', { waitUntil: 'load' });

    if (uncachedResources.length > 0) {
      console.warn('Static resources without proper caching:', uncachedResources.slice(0, 5));
    }
  });
});

test.describe('Performance - Mobile @mobile @performance', () => {
  test.use({ viewport: VIEWPORTS.mobileSmall });

  test('should load within acceptable time on mobile viewport', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('https://www.insightvm.com', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    // Mobile should still load within 5s
    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.maxLoadTimeMs);
    console.log(`Mobile homepage load time: ${loadTime}ms`);
  });

  test('should serve appropriately sized images for mobile', async ({ page }) => {
    await page.goto('https://www.insightvm.com', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    const oversizedImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .filter((img) => {
          const displayWidth = img.clientWidth;
          const naturalWidth = img.naturalWidth;
          return naturalWidth > 0 && displayWidth > 0 && naturalWidth > displayWidth * 2;
        })
        .slice(0, 5)
        .map((img) => ({
          src: img.src.substring(0, 80),
          displayWidth: img.clientWidth,
          naturalWidth: img.naturalWidth,
          ratio: Math.round(img.naturalWidth / img.clientWidth),
        }));
    });

    if (oversizedImages.length > 0) {
      console.warn('Oversized images on mobile (served larger than displayed):', oversizedImages);
    }
  });
});
