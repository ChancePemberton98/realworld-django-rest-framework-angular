import { Page } from '@playwright/test';
import { UserCredentials, TestConfig } from './config-loader';

/**
 * Ensures a user exists by creating them via API
 * If user already exists, this will fail silently
 */
export async function ensureUserExists(
  page: Page,
  apiUrl: string,
  user: UserCredentials
): Promise<void> {
  try {
    const response = await page.request.post(`${apiUrl}/api/users`, {
      data: {
        user: {
          username: user.username,
          email: user.email,
          password: user.password
        }
      }
    });

    if (!response.ok()) {
      // User likely already exists, which is fine
      console.log(`User ${user.username} might already exist`);
    }
  } catch (error) {
    // Ignore errors - user likely already exists
    console.log(`Error creating user ${user.username}:`, error);
  }
}

/**
 * Creates a unique user for testing (useful for tests that need fresh users)
 */
export async function createUniqueUser(
  page: Page,
  apiUrl: string,
  baseUsername: string,
  baseEmail: string,
  password: string
): Promise<{ username: string; email: string; password: string }> {
  const timestamp = Date.now();
  const username = `${baseUsername}_${timestamp}`;
  const email = `${baseUsername}_${timestamp}@example.com`;

  const response = await page.request.post(`${apiUrl}/api/users`, {
    data: {
      user: {
        username,
        email,
        password
      }
    }
  });

  if (!response.ok()) {
    throw new Error(`Failed to create unique user: ${await response.text()}`);
  }

  return { username, email, password };
}

/**
 * Login via API and return the auth token
 */
export async function loginViaAPI(
  page: Page,
  apiUrl: string,
  email: string,
  password: string
): Promise<string> {
  const response = await page.request.post(`${apiUrl}/api/users/login`, {
    data: {
      user: {
        email,
        password
      }
    }
  });

  if (!response.ok()) {
    throw new Error(`Login failed: ${await response.text()}`);
  }

  const data = await response.json();
  return data.user.token;
}

/**
 * Follow a user via API
 * @param page - Playwright page object
 * @param apiUrl - API base URL
 * @param authToken - Auth token of the user who wants to follow
 * @param usernameToFollow - Username of the user to follow
 */
export async function followUserViaAPI(
  page: Page,
  apiUrl: string,
  authToken: string,
  usernameToFollow: string
): Promise<void> {
  const response = await page.request.post(`${apiUrl}/api/profiles/${usernameToFollow}/follow`, {
    headers: {
      'Authorization': `Token ${authToken}`
    }
  });

  if (!response.ok()) {
    throw new Error(`Failed to follow user: ${await response.text()}`);
  }
}

/**
 * Unfollow a user via API
 * @param page - Playwright page object
 * @param apiUrl - API base URL
 * @param authToken - Auth token of the user who wants to unfollow
 * @param usernameToUnfollow - Username of the user to unfollow
 */
export async function unfollowUserViaAPI(
  page: Page,
  apiUrl: string,
  authToken: string,
  usernameToUnfollow: string
): Promise<void> {
  const response = await page.request.delete(`${apiUrl}/api/profiles/${usernameToUnfollow}/follow`, {
    headers: {
      'Authorization': `Token ${authToken}`
    }
  });

  if (!response.ok()) {
    throw new Error(`Failed to unfollow user: ${await response.text()}`);
  }
}

/**
 * Setup follow relationships from config
 * @param page - Playwright page object
 * @param config - Test configuration
 */
export async function setupFollowRelationships(
  page: Page,
  config: TestConfig
): Promise<void> {
  for (const relationship of config.followRelationships) {
    // Get the follower user credentials
    const followerUser = config.users[relationship.follower as keyof typeof config.users];
    const followingUser = config.users[relationship.following as keyof typeof config.users];

    if (!followerUser || !followingUser) {
      console.warn(`Skipping follow relationship: ${relationship.follower} -> ${relationship.following} (user not found)`);
      continue;
    }

    // Login as follower and get token
    const token = await loginViaAPI(page, config.apiUrl, followerUser.email, followerUser.password);

    // Follow the user
    await followUserViaAPI(page, config.apiUrl, token, followingUser.username);

    console.log(`Success: ${followerUser.username} is now following ${followingUser.username}`);
  }
}

