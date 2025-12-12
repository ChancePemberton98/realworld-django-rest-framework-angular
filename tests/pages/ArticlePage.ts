import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ArticlePage extends BasePage {
  readonly articleTitle = this.page.locator('.banner h1');
  readonly articleBody = this.page.locator('.article-content');
  readonly commentTextarea = this.page.locator('textarea.form-control');
  readonly postCommentButton = this.page.locator('button:has-text("Post Comment")');
  readonly editArticleButton = this.page.locator('button:has-text("Edit Article")').first();
  readonly deleteArticleButton = this.page.locator('button:has-text("Delete Article")').first();

  async navigate(articleSlug: string) {
    await super.navigate(`/article/${articleSlug}`);
  }

  async waitForArticlePage() {
    await expect(this.articleTitle).toBeVisible();
  }

  async addComment(commentBody: string) {
    await this.commentTextarea.fill(commentBody);

    // Wait for the API response when posting the comment
    await Promise.all([
      this.page.waitForResponse(response =>
        response.url().includes('/comments') &&
        response.request().method() === 'POST' &&
        (response.status() === 200 || response.status() === 201)
      ),
      this.postCommentButton.click()
    ]);

    // Wait for the comment to appear in the DOM
    const commentCard = this.page.locator('.card').filter({ hasText: commentBody });
    await commentCard.waitFor({ state: 'visible', timeout: 10000 });
  }

  async deleteComment(commentBody: string) {
    const commentCard = this.page.locator('.card').filter({ hasText: commentBody });
    await commentCard.locator('.ion-trash-a').click();

    // Wait for the comment to disappear from the DOM
    await commentCard.waitFor({ state: 'hidden', timeout: 10000 });
  }

  async validateCommentExists(commentBody: string) {
    const commentCard = this.page.locator('.card').filter({ hasText: commentBody });
    await expect(commentCard).toBeVisible();
    await expect(commentCard.locator('.card-text')).toContainText(commentBody);
  }

  async validateCommentNotExists(commentBody: string) {
    const commentCard = this.page.locator('.card').filter({ hasText: commentBody });
    await expect(commentCard).not.toBeVisible();
  }

  async clickEditArticle() {
    await this.editArticleButton.click();
  }

  async clickDeleteArticle() {
    await this.deleteArticleButton.click();
  }

  async getArticleBody(): Promise<string> {
    return await this.articleBody.textContent() || '';
  }

  async validateArticleBody(expectedBody: string) {
    // Wait for network to be idle to ensure article is loaded
    await this.page.waitForLoadState('networkidle');

    // Retry with page refresh if body hasn't updated yet (not ideal but there's some flakiness without this)
    let retries = 3;
    while (retries > 0) {
      try {
        await expect(this.articleBody).toContainText(expectedBody, { timeout: 5000 });
        return; // Success, exit
      } catch (error) {
        retries--;
        if (retries === 0) {
          // Log the actual content for debugging
          const actualContent = await this.articleBody.textContent();
          console.log(`Expected: "${expectedBody}"`);
          console.log(`Actual: "${actualContent}"`);
          throw error;
        }

        // Refresh and try again
        await this.page.reload();
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000);
      }
    }
  }
}

