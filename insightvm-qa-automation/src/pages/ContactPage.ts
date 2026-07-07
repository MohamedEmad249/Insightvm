import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ContactPage - Page Object for contact/form sections.
 * Handles contact form interactions, validation testing.
 */
export class ContactPage extends BasePage {
  readonly contactForm: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly messageInput: Locator;
  readonly subjectInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessages: Locator;

  constructor(page: Page) {
    super(page);

    // Contact form selectors - flexible for various form implementations
    this.contactForm = page.locator('form, [class*="contact-form"], [class*="form"]').first();
    this.nameInput = page.locator('input[name*="name" i], input[placeholder*="name" i], input[placeholder*="ad" i], input[type="text"]').first();
    this.emailInput = page.locator('input[name*="email" i], input[placeholder*="email" i], input[placeholder*="e-posta" i], input[type="email"]').first();
    this.phoneInput = page.locator('input[name*="phone" i], input[name*="tel" i], input[placeholder*="phone" i], input[placeholder*="telefon" i], input[type="tel"]').first();
    this.messageInput = page.locator('textarea, textarea[name*="message" i], textarea[placeholder*="message" i], textarea[placeholder*="mesaj" i]').first();
    this.subjectInput = page.locator('input[name*="subject" i], input[placeholder*="subject" i], input[placeholder*="konu" i], select[name*="subject" i]').first();
    this.submitButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Send"), button:has-text("Gönder"), button:has-text("Submit")').first();
    this.successMessage = page.locator('[class*="success"], [class*="thank"], [role="alert"]').first();
    this.errorMessages = page.locator('[class*="error"], [class*="invalid"]');
  }

  /** Navigate to the contact section */
  async goto(): Promise<void> {
    await this.navigate('/');
    await this.waitForPageLoad();
    // Try to scroll to contact section if on same page
    try {
      await this.scrollToElement('[class*="contact"], [id*="contact"], form');
    } catch {
      // Contact might be on a separate page
      await this.navigate('/contact');
    }
  }

  /** Fill contact form with test data */
  async fillContactForm(data: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    subject?: string;
  }): Promise<void> {
    if (data.name) {
      try { await this.nameInput.fill(data.name); } catch { /* field may not exist */ }
    }
    if (data.email) {
      try { await this.emailInput.fill(data.email); } catch { /* field may not exist */ }
    }
    if (data.phone) {
      try { await this.phoneInput.fill(data.phone); } catch { /* field may not exist */ }
    }
    if (data.message) {
      try { await this.messageInput.fill(data.message); } catch { /* field may not exist */ }
    }
    if (data.subject) {
      try { await this.subjectInput.fill(data.subject); } catch { /* field may not exist */ }
    }
  }

  /** Submit the contact form */
  async submitForm(): Promise<void> {
    await this.submitButton.click();
  }

  /** Check if form exists on the page */
  async hasContactForm(): Promise<boolean> {
    return await this.isElementVisible('form, [class*="contact-form"]');
  }

  /** Check for validation errors */
  async getValidationErrors(): Promise<string[]> {
    const errors: string[] = [];
    const count = await this.errorMessages.count();
    for (let i = 0; i < count; i++) {
      const text = (await this.errorMessages.nth(i).textContent()) || '';
      if (text.trim()) errors.push(text.trim());
    }
    return errors;
  }

  /** Check if success message is displayed */
  async isSuccessMessageVisible(): Promise<boolean> {
    try {
      return await this.successMessage.isVisible();
    } catch {
      return false;
    }
  }
}
