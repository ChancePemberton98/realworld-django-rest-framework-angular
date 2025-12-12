import { test, expect } from '@playwright/test';
import { loadConfig } from '../utils/config-loader';
import { LoginPage } from '../pages/LoginPage';
import { EditorPage } from '../pages/EditorPage';
import { HomePage } from '../pages/HomePage';
import { ProfilePage } from '../pages/ProfilePage';

const config = loadConfig();

test.describe('Write Article', () => {

  test('should create an article and see it in My Articles', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const editorPage = new EditorPage(page);
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

    await homePage.clickUserProfile();
    await profilePage.validateArticleInMyArticles(
      articleTitle,
      config.testData.article.description,
      config.testData.article.tags
    );
  });
});

