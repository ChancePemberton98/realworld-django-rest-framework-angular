# RealWorld UI Automation Tests

UI automation tests for the RealWorld application using Playwright with TypeScript.

---

## 🚀 Quick Start (For Recipients)

If you received this test package as a zip file, follow these steps to get started:

### Step 1: Extract the Files
Extract the zip file to your desired location.

### Step 2: Install Node.js
Ensure you have **Node.js v18 or higher** installed:
- Download from: https://nodejs.org/
- Verify installation: `node --version`

### Step 3: Install Dependencies
Open a terminal and navigate to the `tests` folder and run:
```bash
npm install
```

### Step 4: Install Playwright Browsers
```bash
npx playwright install chromium
```

### Step 5: Start the Application
The tests require the RealWorld application to be running. You have two options:

**Option A: Using Docker (Recommended)**
```bash
# Navigate to the project root (parent of tests folder)
cd ..
docker compose up -d
```

**Option B: Point to Existing Instance**
Edit `config.yml` and update the `baseUrl` to point to your running application instance.

### Step 6: Run the Tests
```bash
# Run all tests (headless)
npm test

# Run with visible browser
npm run test:headed

# Run in interactive UI mode
npm run test:ui
```

### Step 7: View Results
```bash
npm run report
```

**That's it!** 🎉 The tests will automatically create test users and run all test scenarios.

---

## Test Coverage

This test suite covers the following user journeys:

### Core Journeys (Required)
1. **Sign-up & Login** (`SignupTests.spec.ts`)
   - Register a new user
   - Attempt login with wrong password → expect HTTP 422 error

2. **Write Article** (`ArticleTests.spec.ts`)
   - Logged-in user creates an article (title, description, body, tags)
   - Article appears in "My Articles" list on profile

3. **Follow Feed** (`FollowerTests.spec.ts`)
   - User A follows User B (via API setup)
   - User B publishes a new article
   - Article shows up in User A's "My Feed"

4. **Comments** (`CommentTests.spec.ts`)
   - Logged-in user adds a comment to an article
   - Comment displays on the article page
   - User deletes their comment
   - Comment disappears from the article page

5. **Edit / Delete Article** (`EditDeleteArticleTests.spec.ts`)
   - Author edits article body
   - Author removes existing tag and adds new tag
   - Changes are visible on article page
   - Author deletes the article
   - Article disappears from all lists (profile, homepage)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose (for running the application locally)

## Project Structure

```
tests/
├── pages/              # Page Object Model classes
│   ├── BasePage.ts
│   ├── HomePage.ts
│   ├── LoginPage.ts
│   ├── SignupPage.ts
│   ├── EditorPage.ts
│   ├── ProfilePage.ts
│   ├── ArticlePage.ts
│   └── SettingsPage.ts
├── specs/              # Test specifications
│   ├── SignupTests.spec.ts
│   ├── ArticleTests.spec.ts
│   ├── FollowerTests.spec.ts
│   ├── CommentTests.spec.ts
│   └── EditDeleteArticleTests.spec.ts
├── utils/              # Utility functions
│   ├── config-loader.ts
│   └── user-helper.ts
├── global-setup.ts     # Global setup - creates test users before tests run
├── config.yml          # Test configuration (URLs, credentials, test data)
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

## 🧹 Test User Management

The test suite uses a **global setup** (`global-setup.ts`) that automatically creates test users via API before tests run.

**Note:** The RealWorld API doesn't provide a user deletion endpoint, so test users are reused across test runs. The global setup handles this gracefully:
- If users don't exist → creates them
- If users already exist → continues with existing users (shows warning but doesn't fail)

This means you can run tests repeatedly without manual cleanup.

## 🔧 Advanced Setup (For Developers)

### Configuration Options

Edit `config.yml` to customize test configuration:
- `baseUrl`: Application URL (default: http://localhost:4200)
- `users`: Test user credentials (userA and userB are auto-created by global setup)
- `testData`: Test data for articles, comments, etc.

**Note:** Test users (userA and userB) are automatically created via the global setup script before tests run.

### Linux/CI Environments

For headless Linux environments (Alpine/Ubuntu), install system dependencies:

```bash
npx playwright install-deps chromium
```

## 🧪 Running Tests

### Available Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests (headless) |
| `npm run test:headed` | Run tests with visible browser |
| `npm run test:ui` | Run in interactive UI mode |
| `npm run test:debug` | Run in debug mode with Playwright Inspector |
| `npm run report` | View HTML test report |

### Run Specific Tests

```bash
# Run a specific test file
npx playwright test specs/SignupTests.spec.ts

# Run tests matching a pattern
npx playwright test --grep "should create an article"

# Run in a specific browser
npx playwright test --project=chromium
```

## Writing Tests

Tests follow the Page Object Model (POM) pattern:

1. **Page Objects** (`pages/` directory): Contain page-specific selectors and methods
2. **Test Specs** (`specs/` directory): Contain test cases that use page objects
3. **Configuration** (`config.yml`): Parameterized test data and settings

### Example Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { loadConfig } from '../utils/config-loader';
import { LoginPage } from '../pages/LoginPage';

const config = loadConfig();

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(config.users.userA.email, config.users.userA.password);
    // Add assertions
  });
});
```

## 📦 Creating a Distribution Package

To create a clean zip file for sharing (excludes node_modules, test results, etc.):

### Windows (PowerShell)
```powershell
.\create-test-package.ps1
```

This creates `playwright-tests.zip` containing only essential files (~50-100 KB).

### Manual Method
If the script doesn't work, manually zip these folders/files:
- `pages/`, `specs/`, `utils/`
- `config.yml`, `global-setup.ts`, `playwright.config.ts`
- `package.json`, `tsconfig.json`, `README.md`, `.gitignore`

**Exclude:** `node_modules/`, `test-results/`, `playwright-report/`, `package-lock.json`

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Application not running** | Ensure Docker containers are up: `docker compose ps` |
| **Port conflicts** | Check if port 4200 is available or update `baseUrl` in `config.yml` |
| **Browser installation issues** | Run `npx playwright install --with-deps chromium` |
| **Tests timing out** | Increase timeout in `playwright.config.ts` or check application performance |
| **User creation fails** | Ensure backend is running and accessible at the configured URL |

---

## 🎯 Best Practices

1. **Keep tests independent** - Each test should be able to run in isolation
2. **Use Page Object Model** - Keep selectors and actions in page objects
3. **Parameterize test data** - Use `config.yml` for test data
4. **Wait for API responses** - Use `waitForResponse()` for reliable tests
5. **Use semantic selectors** - Prefer role-based selectors when possible

