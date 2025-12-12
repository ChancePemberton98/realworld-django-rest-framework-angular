import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly pageTitle = this.page.locator('h1:has-text("conduit")');
  readonly signupButton = this.page.locator('a[href="#/register"]');
  readonly loginButton = this.page.locator('a[href="#/login"]');
  readonly settingsLink = this.page.locator('a[href="#/settings"]');
  readonly userProfileLink = this.page.locator('a[href="#/my-profile"]');
  readonly newArticleButton = this.page.locator('a[href="#/editor"]');
  readonly myFeedTab = this.page.locator('a:has-text("My Feed")');
  readonly homeLink = this.page.locator('a[href="#/"]:has-text("Home")');

  async navigate() {
    await super.navigate('/');
  }

  async clickHome() {
    await this.homeLink.click();
  }

  async waitForHomePage() {
    await expect(this.pageTitle).toBeVisible();
  }

  async clickSignup() {
    await this.signupButton.click();
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async clickSettings() {
    await this.settingsLink.click();
  }

  async clickUserProfile() {
    await this.userProfileLink.click();
  }

  async clickNewArticle() {
    await this.newArticleButton.click();
  }

  async clickMyFeedTab() {
    await this.myFeedTab.click();
  }

  async clickArticle(articleTitle: string) {
    const articlePreview = this.page.locator('.article-preview').filter({ hasText: articleTitle });
    const articleLink = articlePreview.locator('a.preview-link');

    // Retry with page refresh if article not found
    let retries = 3;
    while (retries > 0) {
      try {
        await articleLink.click({ timeout: 5000 });
        return; // Success, exit
      } catch (error) {
        retries--;
        if (retries === 0) throw error;

        // Refresh and try again
        await this.page.reload();
        await this.page.waitForTimeout(1000);
      }
    }
  }

  async validateArticleInMyFeed(articleTitle: string, articleDescription: string, articleTags: string[]) {
    const articlePreview = this.page.locator('.article-preview').filter({ hasText: articleTitle });
    await expect(articlePreview).toBeVisible();
    await expect(articlePreview.locator('a.preview-link h1')).toContainText(articleTitle);
    await expect(articlePreview.locator('a.preview-link p')).toContainText(articleDescription);
    for (const tag of articleTags) {
      const tagLocator = articlePreview.locator('li.tag-default').filter({ hasText: new RegExp(`^${tag}$`) });
      await expect(tagLocator).toBeVisible();
    }
  }
}