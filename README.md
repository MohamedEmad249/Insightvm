# 🧪 InsightVM.com — QA Automation Test Suite

Comprehensive end-to-end QA automation for [insightvm.com](https://www.insightvm.com) (Insight Media — Digital Marketing Agency, North Cyprus).

Built with **Playwright** + **TypeScript** using the **Page Object Model** pattern. Tests run against the live website as a real user would — no codebase access required.

---

## 📁 Project Structure

```
insightvm-qa-automation/
├── playwright.config.ts          # Playwright configuration (browsers, viewports, reporting)
├── tsconfig.json                 # TypeScript compiler configuration
├── package.json                  # Dependencies and npm scripts
├── .env.example                  # Environment variable template
├── .gitignore                    # Git ignore rules
│
├── src/                          # Source code (non-test)
│   ├── pages/                    # Page Object Model classes
│   │   ├── BasePage.ts           # Abstract base class with shared helpers
│   │   ├── HomePage.ts           # Homepage page object
│   │   ├── ContactPage.ts        # Contact form page object
│   │   └── index.ts              # Barrel export
│   ├── fixtures/                 # Playwright test fixtures
│   │   └── test-fixtures.ts      # Custom fixtures (homePage, contactPage, consoleCapture)
│   ├── utils/                    # Utility functions
│   │   └── test-helpers.ts       # Viewport configs, perf measurement, a11y checks
│   └── data/                     # Test data
│       └── test-data.ts          # Fake users, invalid inputs, XSS/SQLi payloads
│
├── tests/                        # Test specifications
│   ├── homepage.spec.ts          # Homepage: loading, hero, nav, SEO, mobile, tablet
│   ├── navigation.spec.ts        # Navigation: links, hamburger, mobile menu, scroll
│   ├── contact-form.spec.ts      # Contact form: validation, XSS, special chars
│   ├── accessibility.spec.ts     # Accessibility: WCAG checks, keyboard nav, focus
│   ├── performance.spec.ts       # Performance: load time, FCP, resource sizes
│   ├── cross-browser.spec.ts     # Cross-browser: Chromium, Firefox, WebKit rendering
│   ├── links-and-resources.spec.ts # Links: broken links, social, external, security
│   ├── pricing.spec.ts           # Pricing page: tiers, CTAs, mobile layout
│   ├── inner-pages.spec.ts       # Services, Portfolio, About pages
│   └── visual-regression.spec.ts # Visual regression: screenshot baselines
│
├── bug-reports/                  # Bug documentation
│   ├── bug-report.csv            # Bug tracker (CSV) with all found issues
│   └── BUG_REPORT_TEMPLATE.md   # Template for documenting new bugs
│
├── test-results/                 # Generated: test artifacts (screenshots, videos, traces)
├── playwright-report/            # Generated: HTML test report
└── screenshots/                  # Generated: manual screenshots
```

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** ≥ 18.x ([download](https://nodejs.org))
- **npm** ≥ 9.x (included with Node.js)
- **Git** (optional, for version control)

### Step-by-step Setup

```bash
# 1. Clone or navigate to the project
cd insightvm-qa-automation

# 2. Install dependencies
npm install

# 3. Install Playwright browsers (Chromium, Firefox, WebKit)
npm run install-browsers

# 4. (Optional) Copy and configure environment variables
cp .env.example .env
```

---

## ▶️ Running Tests

### Quick Start

```bash
# Run ALL tests across all browsers
npm test

# Run tests with browser windows visible (headed mode)
npm run test:headed
```

### Run by Browser

```bash
npm run test:chromium      # Chromium (Desktop Chrome) only
npm run test:firefox       # Firefox (Desktop) only
npm run test:webkit        # WebKit (Desktop Safari) only
```

### Run by Device

```bash
npm run test:desktop       # All desktop browsers (Chromium + Firefox + WebKit)
npm run test:mobile        # Mobile browsers (Pixel 5 + iPhone 13)
npm run test:tablet        # Tablet (iPad gen 7)
```

### Run by Feature

```bash
npm run test:homepage      # Homepage tests (loading, hero, nav, SEO)
npm run test:navigation    # Navigation tests (links, hamburger, mobile)
npm run test:contact       # Contact form tests (validation, XSS)
npm run test:accessibility # Accessibility tests (WCAG, keyboard nav)
npm run test:performance   # Performance tests (load time, FCP, size)
npm run test:visual        # Visual regression tests (screenshot diffs)
npm run test:seo           # SEO tests (meta tags, structured data)
npm run test:links         # Link tests (broken, social, external)
npm run test:pricing       # Pricing page tests
npm run test:pages         # Inner pages (Services, Portfolio, About)
npm run test:cross-browser # Cross-browser compatibility
```

### Smoke & Full Suites

```bash
npm run test:smoke         # Quick smoke test (homepage + nav on Chromium)
npm run test:full          # Full suite (Chromium desktop + Mobile Chrome)
```

### Advanced Playwright CLI

```bash
# Run a single test file
npx playwright test tests/homepage.spec.ts

# Run tests matching a pattern
npx playwright test --grep "@seo"

# Run with specific number of workers
npx playwright test --workers=4

# Run in debug mode (step through tests)
npx playwright test --debug

# Run with trace viewer
npx playwright test --trace on

# Update visual regression baselines
npm run update-snapshots
```

---

## 📊 Test Reports

### HTML Report

After running tests, an HTML report is automatically generated:

```bash
# Open the HTML report in your default browser
npm run report
```

The report includes:
- ✅ Pass/fail status for every test
- 📷 Screenshots of failures
- 🎥 Videos of retried tests
- 🔍 Trace files for debugging

Report files are saved to `./playwright-report/`.

### JSON Report

A JSON report is also generated at `./test-results/results.json` for CI/CD integration.

---

## 📸 Screenshots & Videos

| Artifact | When Captured | Location |
|----------|---------------|----------|
| Screenshots | On test failure | `test-results/artifacts/` |
| Videos | On first retry of failed test | `test-results/artifacts/` |
| Traces | On first retry of failed test | `test-results/artifacts/` |
| Manual screenshots | Via `takeScreenshot()` | `screenshots/` |

---

## 🐛 Bug Reports

All discovered issues are tracked in:

- **CSV Tracker**: [`bug-reports/bug-report.csv`](bug-reports/bug-report.csv)
- **Bug Template**: [`bug-reports/BUG_REPORT_TEMPLATE.md`](bug-reports/BUG_REPORT_TEMPLATE.md)

### Bug Report Fields

| Field | Description |
|-------|-------------|
| Bug ID | Unique identifier (BUG-NNN) |
| Title | Short description |
| URL | Page where bug occurs |
| Device/Browser | Viewport and browser |
| Severity | Critical / High / Medium / Low |
| Steps to Reproduce | Numbered step-by-step |
| Expected Result | What should happen |
| Actual Result | What actually happens |
| Screenshot/Video | Evidence path |
| Suggested Fix | Recommended remediation |

---

## 🏗️ Architecture & Design Decisions

### Page Object Model (POM)

Each page has a dedicated class inheriting from `BasePage`:

```typescript
// Example: Using a page object in a test
test('should display hero section', async ({ homePage }) => {
  await homePage.goto();
  const isVisible = await homePage.isHeroVisible();
  expect(isVisible).toBe(true);
});
```

### Custom Fixtures

Tests use custom Playwright fixtures for dependency injection:

```typescript
// Available fixtures in every test:
// - homePage: HomePage instance
// - contactPage: ContactPage instance
// - consoleCapture: { errors: string[], warnings: string[] }
```

### Resilient Selectors

All page objects use **multiple fallback selectors** to handle:
- CSS class-based selectors (`[class*="hero"]`)
- Semantic HTML selectors (`nav`, `footer`, `h1`)
- ARIA role selectors (`[role="navigation"]`)
- Content-based selectors (`:has-text("...")`)

---

## 🔒 Test Data Policy

- **No real user data** is used in any test
- All form submissions use fictional data from `src/data/test-data.ts`
- XSS and SQL injection payloads are safe test strings
- Contact form tests fill fields but **do not submit** to avoid spam
- Test accounts: None required (public-facing website tests only)

---

## 🖥️ Browser & Device Coverage

| Project | Browser | Viewport | Use Case |
|---------|---------|----------|----------|
| `chromium-desktop` | Chromium | 1920×1080 | Desktop Chrome |
| `firefox-desktop` | Firefox | 1920×1080 | Desktop Firefox |
| `webkit-desktop` | WebKit | 1920×1080 | Desktop Safari |
| `mobile-chrome` | Chromium | Pixel 5 | Android mobile |
| `mobile-safari` | WebKit | iPhone 13 | iOS mobile |
| `tablet-safari` | WebKit | iPad (gen 7) | Tablet |

---

## 🧩 Test Categories & Tags

Tests are tagged for selective execution:

| Tag | Description | Example Command |
|-----|-------------|-----------------|
| `@desktop` | Desktop viewport tests | `npx playwright test --grep @desktop` |
| `@mobile` | Mobile viewport tests | `npx playwright test --grep @mobile` |
| `@tablet` | Tablet viewport tests | `npx playwright test --grep @tablet` |
| `@seo` | SEO validation tests | `npx playwright test --grep @seo` |
| `@accessibility` | Accessibility checks | `npx playwright test --grep @accessibility` |
| `@performance` | Performance tests | `npx playwright test --grep @performance` |
| `@visual` | Visual regression tests | `npx playwright test --grep @visual` |
| `@contact` | Contact form tests | `npx playwright test --grep @contact` |
| `@navigation` | Navigation tests | `npx playwright test --grep @navigation` |

---

## 🔄 CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM UTC

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium firefox webkit
      - name: Run Playwright tests
        run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-results
          path: test-results/
          retention-days: 30
```

---

## 📝 Adding New Tests

1. **Create a page object** (if needed) in `src/pages/` extending `BasePage`
2. **Add it to fixtures** in `src/fixtures/test-fixtures.ts`
3. **Write the test** in `tests/` using the custom fixtures
4. **Add fake data** to `src/data/test-data.ts` if needed
5. **Document bugs** found in `bug-reports/bug-report.csv`

---

## 📜 License

ISC
