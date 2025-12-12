import { expect, Response } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly pageTitle = this.page.locator('h1:has-text("Sign in")');
  readonly emailInput = this.page.locator('input[formcontrolname="email"]');
  readonly passwordInput = this.page.locator('input[formcontrolname="password"]');
  readonly signInButton = this.page.locator('button:has-text("Sign in")');
  readonly errorMessage = this.page.locator('ul.error-messages li');

  async waitForSignInPage() {
    await expect(this.pageTitle).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    // Wait for button to be enabled before clicking
    await expect(this.signInButton).toBeEnabled();
    await this.signInButton.click();

    // Wait for navigation away from login page (successful login)
    await this.page.waitForURL(/^(?!.*#\/login).*$/, { timeout: 10000 });
  }

  async loginExpectingFailure(email: string, wrongPassword: string): Promise<number> {
    // Start listening for the login API response
    const responsePromise = this.page.waitForResponse((resp: Response) =>
      resp.url().includes('/api/users/login')
    );

    await this.emailInput.fill(email);
    await this.passwordInput.fill(wrongPassword);
    await this.signInButton.click();

    // Wait for and capture the response
    const response = await responsePromise;
    const statusCode = response.status();

    // Validate UI error message
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText('Invalid email or password');

    // Return status code for test validation
    return statusCode;
  }
}