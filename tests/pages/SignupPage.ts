import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class SignupPage extends BasePage {
  readonly usernameInput = this.page.locator('input[formcontrolname="username"]');
  readonly emailInput = this.page.locator('input[formcontrolname="email"]');
  readonly passwordInput = this.page.locator('input[formcontrolname="password"]');
  readonly submitButton = this.page.locator('button:has-text("Sign up")');

  async signup(username: string, email: string, password: string) {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();
  }
}

