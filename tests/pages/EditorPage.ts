import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class EditorPage extends BasePage {
  readonly titleInput = this.page.locator('input[formcontrolname="title"]');
  readonly descriptionInput = this.page.locator('input[formcontrolname="description"]');
  readonly bodyInput = this.page.locator('textarea[formcontrolname="body"]');
  readonly tagInput = this.page.locator('input[formcontrolname="tagInput"]');
  readonly publishButton = this.page.locator('button:has-text("Publish Article")');
  readonly tagPill = this.page.locator('.tag-pill');
  readonly removeTagIcon = this.page.locator('.ion-close-round');

  async waitForEditor() {
    await expect(this.bodyInput).toBeVisible();
  }

  async createArticle(title: string, description: string, body: string, tags: string[]) {
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);
    await this.bodyInput.fill(body);

    for (const tag of tags) {
      await this.tagInput.fill(tag);
      await this.tagInput.press('Enter');
    }

    await this.publishButton.click();
  }

  async updateArticleBody(newBody: string) {
    // Use fill with empty string to clear, then fill with new content
    // This isn't super ideal, but it looks like this is the most reliable way with Angular forms
    await this.bodyInput.fill('');
    await this.page.waitForTimeout(200);

    await this.bodyInput.fill(newBody);

    await this.bodyInput.dispatchEvent('input');
    await this.bodyInput.dispatchEvent('change');

    // Again not ideal, but we blur the field to ensure Angular processes the change
    await this.bodyInput.blur();

    // Wait a moment for Angular to process
    await this.page.waitForTimeout(300);

    // Verify the new content is in the field
    await expect(this.bodyInput).toHaveValue(newBody);
  }

  async removeTag(tagName: string) {
    const tagPill = this.page.locator('.tag-pill').filter({ hasText: tagName });
    await tagPill.locator('.ion-close-round').click();
  }

  async addTag(tagName: string) {
    await this.tagInput.fill(tagName);
    await this.tagInput.press('Enter');
  }

  async publishArticle() {
    await Promise.all([
      this.page.waitForResponse(response =>
        response.url().includes('/api/articles') &&
        (response.status() === 200 || response.status() === 201)
      ),
      this.publishButton.click()
    ]);
    // Wait a moment for the UI to update after successful publish
    await this.page.waitForTimeout(1000);
  }
}

