import { test, expect } from '@playwright/test';
import { loadConfig } from '../utils/config-loader';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { EditorPage } from '../pages/EditorPage';
import { ArticlePage } from '../pages/ArticlePage';

const config = loadConfig();

test.describe('Comments', () => {

  test('should add a comment and delete it', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const editorPage = new EditorPage(page);
    const articlePage = new ArticlePage(page);

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

    const commentBody = `${config.testData.comment.body} ${timestamp}`;

    await articlePage.addComment(commentBody);
    await articlePage.validateCommentExists(commentBody);
    await articlePage.deleteComment(commentBody);
    await articlePage.validateCommentNotExists(commentBody);
  });
});

