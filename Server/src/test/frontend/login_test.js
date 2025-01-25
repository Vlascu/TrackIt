import { test, expect } from '@playwright/test';

test.describe('End-to-End Testing of loginUser function', () => {
    test('should log in successfully with valid credentials', async ({ page }) => {
        await page.goto('http://localhost:8080/login');

        await page.evaluate(() => {
            window.loginUser = async (loginData) => {
                const response = await fetch('http://localhost:8080/user/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginData),
                });
                const result = await response.json();
                if (response.ok) {
                    return result;
                } else {
                    alert(result.error);
                }
            };
        });

        // Define valid login credentials
        const validCredentials = { username: 'testuser', password: 'password123' };

        // Call the loginUser function
        const result = await page.evaluate((data) => loginUser(data), validCredentials);

        // Validate the response
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('username', 'testuser');
        expect(result).toHaveProperty('token');
    });

    test('should show an error for invalid credentials', async ({ page }) => {
        // Navigate to the app's login page
        await page.goto('http://localhost:8080/login'); // Replace with your actual login page URL

        // Inject the loginUser function
        await page.evaluate(() => {
            window.loginUser = async (loginData) => {
                const response = await fetch('http://localhost:8080/user/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginData),
                });
                const result = await response.json();
                if (response.ok) {
                    return result;
                } else {
                    alert(result.error);
                }
            };
        });

        // Define invalid login credentials
        const invalidCredentials = { username: 'wronguser', password: 'wrongpassword' };

        // Mock alert to capture the error message
        const alerts = [];
        page.on('dialog', (dialog) => {
            alerts.push(dialog.message());
            dialog.dismiss();
        });

        // Call the loginUser function
        await page.evaluate((data) => loginUser(data), invalidCredentials);

        // Validate the alert message
        expect(alerts).toContain('Invalid credentials'); // Adjust based on your backend's error message
    });
});
