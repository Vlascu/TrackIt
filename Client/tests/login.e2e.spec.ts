import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  const validUser = {
    firstName: 'Iulian',
    lastName: 'Vlascu',
    password: 'Iulian'
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/login');
  });

  test('should redirect to home page after successful login', async ({ page }) => {
    
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Login successful');
      await dialog.dismiss();
    });

    await page.fill('input[data-testid="first-name-input"]', validUser.firstName);
    await page.fill('input[data-testid="last-name-input"]', validUser.lastName);
    await page.fill('input[data-testid="password-input"]', validUser.password);
    
    await page.getByTestId('login-button').click();

    await page.waitForURL('**/home');
    await expect(page).toHaveURL(/home/);
  });

  test('should show error message with invalid credentials', async ({ page }) => {
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Login failed');
      await dialog.dismiss();
    });

    await page.fill('input[data-testid="first-name-input"]', 'Invalid');
    await page.fill('input[data-testid="last-name-input"]', 'User');
    await page.fill('input[data-testid="password-input"]', 'wrongPassword');
    
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL(/login/); 
  });
});