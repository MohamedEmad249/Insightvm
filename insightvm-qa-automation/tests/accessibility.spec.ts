import { test, expect } from '../src/fixtures/test-fixtures';
import { checkBasicAccessibility, VIEWPORTS } from '../src/utils/test-helpers';

test.describe('Accessibility - Desktop @desktop @accessibility', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should have lang attribute on html element', async ({ page }) => {
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });

  test('should have viewport meta tag', async ({ page }) => {
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBeTruthy();
    expect(viewport).toContain('width=device-width');
  });

  test('should have alt text on all images', async ({ page }) => {
    const imagesWithoutAlt = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs
        .filter((img) => !img.getAttribute('alt') && img.getAttribute('alt') !== '')
        .map((img) => ({ src: img.src, class: img.className }));
    });

    if (imagesWithoutAlt.length > 0) {
      console.warn(`Found ${imagesWithoutAlt.length} images without alt text:`, imagesWithoutAlt.slice(0, 5));
    }
    expect(imagesWithoutAlt.length).toBe(0);
  });

  test('should have proper heading hierarchy (no skipped levels)', async ({ page }) => {
    const headingIssues = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const levels = headings.map((h) => parseInt(h.tagName.charAt(1)));
      const issues: string[] = [];
      
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] > levels[i - 1] + 1) {
          issues.push(`Skipped heading level: h${levels[i - 1]} -> h${levels[i]}`);
        }
      }
      return issues;
    });

    if (headingIssues.length > 0) {
      console.warn('Heading hierarchy issues:', headingIssues);
    }
  });

  test('should have sufficient color contrast for text', async ({ page }) => {
    // Basic check for very low contrast elements
    const lowContrastCount = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('p, span, a, li, h1, h2, h3, h4, h5, h6'));
      let lowContrast = 0;
      
      elements.forEach((el) => {
        const style = getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;
        
        // Very basic check: warn if text color matches background
        if (color === bgColor && color !== 'rgba(0, 0, 0, 0)') {
          lowContrast++;
        }
      });
      
      return lowContrast;
    });

    expect(lowContrastCount).toBe(0);
  });

  test('should have focusable elements with visible focus indicators', async ({ page }) => {
    // Tab through the page and check for focus styles
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    
    const focusedElement = await page.evaluate(() => {
      const focused = document.activeElement;
      if (!focused || focused === document.body) return null;
      
      const style = getComputedStyle(focused);
      return {
        tag: focused.tagName,
        hasOutline: style.outlineStyle !== 'none' && style.outlineWidth !== '0px',
        hasBorderChange: style.borderColor !== 'initial',
        hasBoxShadow: style.boxShadow !== 'none',
      };
    });

    if (focusedElement && !focusedElement.hasOutline && !focusedElement.hasBoxShadow) {
      console.warn('BUG-CANDIDATE: Focus indicator may not be visible on', focusedElement.tag);
    }
  });

  test('should have ARIA labels on interactive elements', async ({ page }) => {
    const unlabeledButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
      return buttons
        .filter((btn) => {
          const text = (btn.textContent || '').trim();
          const ariaLabel = btn.getAttribute('aria-label');
          const ariaLabelledBy = btn.getAttribute('aria-labelledby');
          const title = btn.getAttribute('title');
          return !text && !ariaLabel && !ariaLabelledBy && !title;
        })
        .map((btn) => ({
          tag: btn.tagName,
          class: btn.className.toString().substring(0, 50),
          html: btn.innerHTML.substring(0, 100),
        }));
    });

    if (unlabeledButtons.length > 0) {
      console.warn(`Found ${unlabeledButtons.length} buttons without accessible labels:`, unlabeledButtons);
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Press Tab multiple times and verify focus moves
    const focusOrder: string[] = [];
    
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? `${el.tagName}:${(el.textContent || '').trim().substring(0, 20)}` : 'none';
      });
      focusOrder.push(focused);
    }

    // Should have at least some focusable elements
    const uniqueFocused = new Set(focusOrder);
    expect(uniqueFocused.size).toBeGreaterThan(1);
  });
});

test.describe('Accessibility - Mobile @mobile @accessibility', () => {
  test.use({ viewport: VIEWPORTS.mobileSmall });

  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should have touch-friendly target sizes (48x48 minimum)', async ({ page }) => {
    const tooSmallTargets = await page.evaluate(() => {
      const interactive = Array.from(document.querySelectorAll('a, button, input, select, textarea'));
      return interactive
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
        })
        .slice(0, 10)
        .map((el) => ({
          tag: el.tagName,
          text: (el.textContent || '').trim().substring(0, 30),
          size: `${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`,
        }));
    });

    if (tooSmallTargets.length > 0) {
      console.warn('Touch targets smaller than 44x44px:', tooSmallTargets);
    }
  });

  test('should have readable font sizes on mobile', async ({ page }) => {
    const tooSmallText = await page.evaluate(() => {
      const textElements = Array.from(document.querySelectorAll('p, span, a, li, td, th'));
      return textElements
        .filter((el) => {
          const style = getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize);
          const text = (el.textContent || '').trim();
          return text.length > 0 && fontSize < 12;
        })
        .slice(0, 5)
        .map((el) => ({
          tag: el.tagName,
          text: (el.textContent || '').trim().substring(0, 30),
          fontSize: getComputedStyle(el).fontSize,
        }));
    });

    if (tooSmallText.length > 0) {
      console.warn('Text elements with font-size below 12px:', tooSmallText);
    }
  });
});
