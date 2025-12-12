import { test, expect } from '@playwright/test';
import { loadConfig } from '../utils/config-loader';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { EditorPage } from '../pages/EditorPage';
import { ArticlePage } from '../pages/ArticlePage';
import { ProfilePage } from '../pages/ProfilePage';

const config = loadConfig();

test.describe('Edit / Delete Article', () => {

  test('should edit article body and tags, then delete it', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const editorPage = new EditorPage(page);
    const articlePage = new ArticlePage(page);
    const profilePage = new ProfilePage(page);

    await homePage.navigate();
    await homePage.clickLogin();
    await loginPage.waitForSignInPage();
    await loginPage.login(config.users.userA.email, config.users.userA.password);
    await homePage.waitForHomePage();

    await homePage.clickNewArticle();

    const timestamp = Date.now();
    const articleTitle = `${config.testData.article.title} ${timestamp}`;

    await editorPage.createArticle(
      articleTitle,
      config.testData.article.description,
      config.testData.article.body,
      config.testData.article.tags
    );

    await homePage.clickHome();
    await homePage.clickArticle(articleTitle);
    await articlePage.waitForArticlePage();

    await articlePage.clickEditArticle();
    await editorPage.waitForEditor();

    const updatedBody = `Updated body content ${timestamp}`;
    await editorPage.updateArticleBody(updatedBody);

    await editorPage.removeTag(config.testData.article.tags[0]);

    const newTag = `newtag${timestamp}`;
    await editorPage.addTag(newTag);

    await editorPage.publishArticle();

    await homePage.clickHome();

    await page.locator('.article-preview').filter({ hasText: articleTitle }).waitFor({ state: 'visible', timeout: 10000 });

    await homePage.clickArticle(articleTitle);
    await articlePage.waitForArticlePage();
    await articlePage.validateArticleBody(updatedBody);

    await homePage.clickUserProfile();
    await profilePage.validateArticleInMyArticles(
      articleTitle,
      config.testData.article.description,
      [config.testData.article.tags[1], config.testData.article.tags[2], newTag]
    );

    await homePage.clickHome();
    await homePage.clickArticle(articleTitle);
    await articlePage.waitForArticlePage();

    await articlePage.clickDeleteArticle();

    await homePage.clickUserProfile();
    const articleExists = await page.locator('.article-preview').filter({ hasText: articleTitle }).count();
    expect(articleExists).toBe(0);
  });
});

