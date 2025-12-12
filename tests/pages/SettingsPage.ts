import { BasePage } from './BasePage';

export class SettingsPage extends BasePage {
  readonly logoutButton = this.page.locator('button:has-text("Or click here to logout.")');

  async navigate() {
    await super.navigate('/settings');
  }

  async logOut() {
    await this.logoutButton.click();
  }
}