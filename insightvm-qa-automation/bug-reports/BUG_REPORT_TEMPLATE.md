# Bug Report Template

Use this template when documenting new bugs found during test execution.

## Bug Report Fields

| Field | Description |
|-------|-------------|
| **Bug ID** | Unique identifier (BUG-NNN format) |
| **Title** | Short descriptive title of the issue |
| **URL** | The specific URL where the bug occurs |
| **Page** | Page name (e.g., Homepage, Contact, Pricing) |
| **Device/Browser** | Device type and browser (e.g., "Mobile (375x667) / Chromium") |
| **Severity** | Critical / High / Medium / Low |
| **Status** | Open / In Progress / Fixed / Verified / Won't Fix |
| **Steps to Reproduce** | Numbered step-by-step instructions to reproduce the bug |
| **Expected Result** | What should happen |
| **Actual Result** | What actually happens |
| **Screenshot/Video** | Path to screenshot or video evidence |
| **Suggested Fix** | Recommendation for resolving the issue |
| **Date Found** | Date the bug was first discovered |
| **Reporter** | Who found the bug (person or "QA Automation") |

---

## Severity Levels

| Level | Description |
|-------|-------------|
| **Critical** | Site is unusable, data loss, security vulnerability |
| **High** | Major feature broken, no workaround available |
| **Medium** | Feature partially broken, workaround exists |
| **Low** | Cosmetic issue, minor UX problem, enhancement request |

---

## Example Bug Report

**Bug ID:** BUG-011
**Title:** Contact form submits without email validation
**URL:** https://www.insightvm.com/contact
**Page:** Contact
**Device/Browser:** Desktop (1920x1080) / Chromium 120
**Severity:** High
**Status:** Open

**Steps to Reproduce:**
1. Navigate to https://www.insightvm.com/contact
2. Fill in name: "Test User"
3. Fill in email: "not-a-valid-email"
4. Fill in message: "Test message"
5. Click "Send" / "Submit" button

**Expected Result:**
Form should validate the email field and show an error message like "Please enter a valid email address."

**Actual Result:**
Form submits successfully without validating email format.

**Screenshot/Video:** `./screenshots/bug-011-contact-form-no-validation.png`

**Suggested Fix:**
Add HTML5 `type="email"` attribute and implement custom JavaScript validation regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Date Found:** 2026-07-07
**Reporter:** QA Automation
