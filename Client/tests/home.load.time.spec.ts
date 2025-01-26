import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  const USER = {
    firstName: 'Iulian',
    lastName: 'Vlascu',
    password: 'Iulian'
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/login');
    
    await page.locator('input[name="firstName"]').fill(USER.firstName);
    await page.locator('input[name="lastName"]').fill(USER.lastName);
    await page.locator('input[name="password"]').fill(USER.password);
  });

  test('Home page load time after login', async ({ page }) => {
    const MAX_LOAD_TIME = 1500;
    
    const startTime = Date.now();
    
    await page.getByTestId('login-button').click();
    await page.waitForURL('**/home');

    await page.locator('.page-wrapper').waitFor({ state: 'visible' });
    await page.waitForLoadState('networkidle');
   
    const loadTime = Date.now() - startTime;
    
    console.log(`Home page loaded in ${loadTime}ms`);
    expect.soft(loadTime)
      .toBeLessThanOrEqual(MAX_LOAD_TIME);

  });
});