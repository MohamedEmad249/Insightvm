/**
 * Fake test data for form submissions and other test scenarios.
 * DO NOT use real user data. All data here is fictional.
 */

export const FAKE_USERS = {
  validUser: {
    name: 'Jane Doe',
    email: 'jane.doe.test@fakemailtest.com',
    phone: '+90-555-123-4567',
    company: 'Test Company LLC',
    message: 'This is an automated test message. Please disregard. Testing form functionality for QA purposes.',
    subject: 'QA Test Inquiry',
  },
  alternateUser: {
    name: 'John Smith',
    email: 'john.smith.qa@fakemailtest.com',
    phone: '+1-555-987-6543',
    company: 'Acme Testing Corp',
    message: 'Automated QA test - please ignore this submission.',
    subject: 'Testing',
  },
  turkishUser: {
    name: 'Ayşe Yılmaz',
    email: 'ayse.yilmaz.test@fakemailtest.com',
    phone: '+90-533-456-7890',
    company: 'Test Şirketi A.Ş.',
    message: 'Bu bir otomatik test mesajıdır. Lütfen dikkate almayınız.',
    subject: 'Test Sorgusu',
  },
} as const;

export const INVALID_DATA = {
  emptyFields: {
    name: '',
    email: '',
    phone: '',
    message: '',
  },
  invalidEmail: {
    name: 'Test User',
    email: 'not-an-email',
    phone: '+90-555-111-2222',
    message: 'Test message with invalid email.',
  },
  xssAttempt: {
    name: '<script>alert("xss")</script>',
    email: 'xss@test.com',
    phone: '+90-555-000-0000',
    message: '<img src=x onerror=alert(1)>',
  },
  sqlInjection: {
    name: "Robert'; DROP TABLE users;--",
    email: 'sqli@test.com',
    phone: '+90-555-000-0001',
    message: "' OR '1'='1",
  },
  longInput: {
    name: 'A'.repeat(500),
    email: 'a'.repeat(250) + '@test.com',
    phone: '1'.repeat(50),
    message: 'B'.repeat(10000),
  },
  specialCharacters: {
    name: 'Tëst Üsér ñ',
    email: 'special+chars@test.com',
    phone: '+90 (555) 123-4567',
    message: 'Special chars: àáâãäåæçèéêë 你好 مرحبا',
  },
} as const;

export const EXPECTED_URLS = {
  home: 'https://www.insightvm.com/',
  homeAlt: 'https://www.insightvm.com',
} as const;

export const EXPECTED_SEO = {
  titleContains: 'Insight',
  descriptionMinLength: 50,
  requiredMetaTags: ['description', 'viewport'],
} as const;

export const SOCIAL_MEDIA_URLS = {
  facebook: 'facebook.com/insightvisionmedia',
  instagram: 'instagram.com/insightvisionmedia',
  linkedin: 'linkedin.com/company/insightvisionmedia',
} as const;
