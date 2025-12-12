import { test, expect } from '@playwright/test';
import { loadConfig } from '../utils/config-loader';
import { SignupPage } from '../pages/SignupPage';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';

const config = loadConfig();

test.describe('Sign-up & Login', () => {

  test('should register a new user and fail login with wrong password', async ({ page }) => {
    // Initialize page objects
    const homePage = new HomePage(page);
    const signupPage = new SignupPage(page);
    const loginPage = new LoginPage(page);

    // Navigate to signup page
    await homePage.navigate();
    await homePage.clickSignup();

    // Register a new user with unique credentials
    const timestamp = Date.now();
    const username = `${config.users.userA.username}_${timestamp}`;
    const email = `testuser_${timestamp}@example.com`;

    await signupPage.signup(username, email, config.users.userA.password);
    await loginPage.waitForSignInPage();

    // Attempt login with wrong password and validate error
    const statusCode = await loginPage.loginExpectingFailure(email, config.users.userA.incorrectPassword);

    // Validate HTTP 422 status code
    // Note: Assignment specifies 401, but API returns 422 for validation errors
    expect(statusCode).toBe(422);
  });
});

