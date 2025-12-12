import { test, expect } from '@playwright/test';
import { loadConfig } from '../utils/config-loader';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { EditorPage } from '../pages/EditorPage';
import { SettingsPage } from '../pages/SettingsPage';
import { setupFollowRelationships } from '../utils/user-helper';

const config = loadConfig();

test.describe('Follow Feed', () => {

  test('should see followed user article in My Feed', async ({ page }) => {
    // Setup: Establish follow relationships via API (User A follows User B)
    await setupFollowRelationships(page, config);

    // Initialize page objects
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const editorPage = new EditorPage(page);
    const settingsPage = new SettingsPage(page);

    // User B logs in and publishes a new article
    await homePage.navigate();
    await homePage.clickLogin();
    await loginPage.waitForSignInPage();
    await loginPage.login(config.users.userB.email, config.users.userB.password);
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

    // User B logs out
    await homePage.clickSettings();
    await settingsPage.logOut();

    // User A logs in and checks "My Feed" for the article
    await homePage.clickLogin();
    await loginPage.waitForSignInPage();
    await loginPage.login(config.users.userA.email, config.users.userA.password);
    await homePage.waitForHomePage();

    // Verify article appears in "My Feed" tab
    await homePage.clickMyFeedTab();
    await homePage.validateArticleInMyFeed(
      articleTitle,
      config.testData.article.description,
      config.testData.article.tags
    );
  });
});

