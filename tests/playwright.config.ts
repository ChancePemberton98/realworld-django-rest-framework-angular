import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as yaml from 'yaml';

// Load configuration from YAML
const configFile = fs.readFileSync('./config.yml', 'utf8');
const config = yaml.parse(configFile);

export default defineConfig({
  testDir: './specs',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry once locally, twice in CI
  workers: process.env.CI ? 1 : 1,
  globalSetup: require.resolve('./global-setup'),
  reporter: [
    ['html'],
    ['list']
  ],
  
  use: {
    baseURL: config.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  timeout: config.timeouts.default,
  expect: {
    timeout: 5000
  },
});

