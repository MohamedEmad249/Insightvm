import { test as base, Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ContactPage } from '../pages/ContactPage';
import { setupConsoleErrorCapture } from '../utils/test-helpers';

/**
 * Custom test fixtures that provide pre-configured page objects.
 * These fixtures automatically set up console error capture and provide
 * typed page objects for each test.
 */
type TestFixtures = {
  homePage: HomePage;
  contactPage: ContactPage;
  consoleCapture: { errors: string[]; warnings: string[] };
};

export const test = base.extend<TestFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  contactPage: async ({ page }, use) => {
    const contactPage = new ContactPage(page);
    await use(contactPage);
  },

  consoleCapture: async ({ page }, use) => {
    const capture = setupConsoleErrorCapture(page);
    await use(capture);
  },
});

export { expect } from '@playwright/test';
