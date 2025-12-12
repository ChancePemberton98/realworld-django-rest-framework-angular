import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  async navigate(username: string) {
    await super.navigate(`/profile/${username}`);
  }

  async validateArticleInMyArticles(articleTitle: string, articleDescription: string, articleTags: string[]) {
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

