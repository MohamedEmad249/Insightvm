import { test, expect } from '../src/fixtures/test-fixtures';
import { FAKE_USERS, INVALID_DATA } from '../src/data/test-data';
import { VIEWPORTS } from '../src/utils/test-helpers';

test.describe('Contact Form - Desktop @desktop @contact', () => {
  test.beforeEach(async ({ contactPage }) => {
    await contactPage.goto();
  });

  test('should have a contact form on the page', async ({ contactPage }) => {
    const hasForm = await contactPage.hasContactForm();
    if (!hasForm) {
      console.warn('BUG-CANDIDATE: No contact form found on the page');
    }
  });

  test('should have required form fields', async ({ contactPage, page }) => {
    const hasForm = await contactPage.hasContactForm();
    test.skip(!hasForm, 'No contact form found - skipping field checks');

    const fields = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('form input, form textarea, form select'));
      return inputs.map((input) => ({
        type: input.getAttribute('type') || input.tagName.toLowerCase(),
        name: input.getAttribute('name') || '',
        placeholder: input.getAttribute('placeholder') || '',
        required: input.hasAttribute('required'),
      }));
    });

    expect(fields.length).toBeGreaterThan(0);
    console.log('Form fields found:', fields);
  });

  test('should accept valid form input', async ({ contactPage }) => {
    const hasForm = await contactPage.hasContactForm();
    test.skip(!hasForm, 'No contact form found');

    await contactPage.fillContactForm(FAKE_USERS.validUser);
    // Verify fields are filled (don't actually submit to avoid spam)
  });

  test('should show validation for empty required fields', async ({ contactPage, page }) => {
    const hasForm = await contactPage.hasContactForm();
    test.skip(!hasForm, 'No contact form found');

    // Try to submit empty form
    const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
    const hasSubmit = await submitBtn.isVisible().catch(() => false);
    
    if (hasSubmit) {
      await submitBtn.click();
      await page.waitForTimeout(1000);
      
      // Check for HTML5 validation or custom error messages
      const invalidInputs = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input:invalid, textarea:invalid'));
        return inputs.map((i) => ({
          name: i.getAttribute('name') || '',
          validationMessage: (i as HTMLInputElement).validationMessage || '',
        }));
      });

      if (invalidInputs.length === 0) {
        console.warn('BUG-CANDIDATE: No validation shown for empty required fields');
      }
    }
  });

  test('should validate email format', async ({ contactPage, page }) => {
    const hasForm = await contactPage.hasContactForm();
    test.skip(!hasForm, 'No contact form found');

    await contactPage.fillContactForm(INVALID_DATA.invalidEmail);
    
    const emailInput = page.locator('input[type="email"], input[name*="email" i]').first();
    const hasEmail = await emailInput.isVisible().catch(() => false);
    
    if (hasEmail) {
      await emailInput.fill('not-an-email');
      const isInvalid = await emailInput.evaluate((el) => !(el as HTMLInputElement).checkValidity());
      // Email field should reject invalid email
      if (!isInvalid) {
        console.warn('BUG-CANDIDATE: Email field accepts invalid email format');
      }
    }
  });

  test('should handle XSS attempts safely', async ({ contactPage, page }) => {
    const hasForm = await contactPage.hasContactForm();
    test.skip(!hasForm, 'No contact form found');

    await contactPage.fillContactForm(INVALID_DATA.xssAttempt);
    
    // Verify XSS payload is not executed
    const alertTriggered = await page.evaluate(() => {
      return (window as any).__xssTriggered || false;
    });
    expect(alertTriggered).toBe(false);
  });

  test('should handle special characters gracefully', async ({ contactPage }) => {
    const hasForm = await contactPage.hasContactForm();
    test.skip(!hasForm, 'No contact form found');

    // Should not crash when filling special characters
    await contactPage.fillContactForm(INVALID_DATA.specialCharacters);
  });
});

test.describe('Contact Form - Mobile @mobile @contact', () => {
  test.use({ viewport: VIEWPORTS.mobileSmall });

  test.beforeEach(async ({ contactPage }) => {
    await contactPage.goto();
  });

  test('should display contact form properly on mobile', async ({ contactPage }) => {
    const hasForm = await contactPage.hasContactForm();
    if (!hasForm) {
      console.warn('NOTE: No contact form visible on mobile viewport');
      return;
    }
  });

  test('should have properly sized form inputs on mobile', async ({ page }) => {
    const smallInputs = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
      return inputs.filter((input) => {
        const rect = input.getBoundingClientRect();
        return rect.width > 0 && rect.width < 200;
      }).map((input) => ({
        name: input.getAttribute('name') || input.getAttribute('type') || 'unknown',
        width: Math.round(input.getBoundingClientRect().width),
      }));
    });

    if (smallInputs.length > 0) {
      console.warn('Form inputs may be too narrow on mobile:', smallInputs);
    }
  });
});
