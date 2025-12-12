import { chromium, FullConfig } from '@playwright/test';
import { loadConfig } from './utils/config-loader';

async function globalSetup(config: FullConfig) {
  const testConfig = loadConfig();
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Starting global setup...');
  console.log(`API URL: ${testConfig.apiUrl}`);

  // Create userA
  try {
    const response = await page.request.post(`${testConfig.apiUrl}/api/users`, {
      data: {
        user: {
          username: testConfig.users.userA.username,
          email: testConfig.users.userA.email,
          password: testConfig.users.userA.password
        }
      }
    });

    if (response.ok()) {
      console.log('Success: UserA created successfully');
    } else {
      const errorBody = await response.text();
      console.log('Warning: UserA creation failed (might already exist):', errorBody);
    }
  } catch (error) {
    console.log('Warning: UserA creation error:', error);
  }

  // Create userB
  try {
    const response = await page.request.post(`${testConfig.apiUrl}/api/users`, {
      data: {
        user: {
          username: testConfig.users.userB.username,
          email: testConfig.users.userB.email,
          password: testConfig.users.userB.password
        }
      }
    });

    if (response.ok()) {
      console.log('Success: UserB created successfully');
    } else {
      const errorBody = await response.text();
      console.log('Warning: UserB creation failed (might already exist):', errorBody);
    }
  } catch (error) {
    console.log('Warning: UserB creation error:', error);
  }

  await browser.close();
  console.log('Success: Global setup complete!\n');
}

export default globalSetup;

