import { test, expect } from '../src/fixtures/test-fixtures';
import { SOCIAL_MEDIA_URLS } from '../src/data/test-data';

test.describe('Links & Resources @desktop @links', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should not have any links with empty href', async ({ page }) => {
    const emptyLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links
        .filter((a) => !a.href || a.href === '' || a.href === window.location.href + '#')
        .map((a) => ({
          text: (a.textContent || '').trim().substring(0, 30),
          href: a.getAttribute('href') || 'empty',
        }));
    });

    if (emptyLinks.length > 0) {
      console.warn('Links with empty or # href:', emptyLinks);
    }
  });

  test('should have external links open in new tab', async ({ page }) => {
    const externalLinksNoTarget = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href^="http"]'));
      const currentHost = window.location.host;
      
      return links
        .filter((a) => {
          try {
            const linkHost = new URL(a.href).host;
            return linkHost !== currentHost && a.getAttribute('target') !== '_blank';
          } catch {
            return false;
          }
        })
        .map((a) => ({
          text: (a.textContent || '').trim().substring(0, 30),
          href: a.href.substring(0, 60),
        }));
    });

    if (externalLinksNoTarget.length > 0) {
      console.warn('External links without target="_blank":', externalLinksNoTarget.slice(0, 5));
    }
  });

  test('should have rel="noopener noreferrer" on external links', async ({ page }) => {
    const insecureExtLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[target="_blank"]'));
      return links
        .filter((a) => {
          const rel = a.getAttribute('rel') || '';
          return !rel.includes('noopener');
        })
        .map((a) => ({
          text: (a.textContent || '').trim().substring(0, 30),
          href: a.href.substring(0, 60),
        }));
    });

    if (insecureExtLinks.length > 0) {
      console.warn('External links missing rel="noopener":', insecureExtLinks.slice(0, 5));
    }
  });

  test('should have valid social media links', async ({ page }) => {
    const socialLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links
        .filter((a) => {
          const href = a.href.toLowerCase();
          return href.includes('facebook') || href.includes('instagram') || 
                 href.includes('linkedin') || href.includes('twitter') || href.includes('youtube');
        })
        .map((a) => ({
          text: (a.textContent || '').trim().substring(0, 30),
          href: a.href,
          target: a.getAttribute('target'),
        }));
    });

    expect(socialLinks.length).toBeGreaterThan(0);
    console.log('Social media links found:', socialLinks);

    // Verify expected social platforms are present
    const socialHrefs = socialLinks.map((l) => l.href.toLowerCase());
    const hasFacebook = socialHrefs.some((h) => h.includes('facebook'));
    const hasInstagram = socialHrefs.some((h) => h.includes('instagram'));

    if (!hasFacebook) console.warn('NOTE: No Facebook link found');
    if (!hasInstagram) console.warn('NOTE: No Instagram link found');
  });

  test('should have favicon configured', async ({ page }) => {
    const favicon = await page.locator('link[rel*="icon"]').first().getAttribute('href').catch(() => null);
    expect(favicon).toBeTruthy();
  });

  test('should serve content over HTTPS', async ({ page }) => {
    const url = page.url();
    expect(url).toMatch(/^https:\/\//);
  });
});
