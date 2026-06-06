import { test, expect } from '@playwright/test';

test('has title and loads repository data', async ({ page }) => {
  const url = 'https://4444j99.github.io/github-stars/';
  console.log(`Navigating to: ${url}`);
  
  // Use a longer timeout for initial navigation
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

  console.log('Current URL:', page.url());
  console.log('Current Title:', await page.title());

  // Wait for the correct title
  await expect(page).toHaveTitle(/web/, { timeout: 30000 });

  console.log('Title verified. Checking for application shell...');

  // Wait for the application shell to load (sidebar should contain categories)
  await expect(page.getByText('Categories', { exact: true })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Star Vault', { exact: true })).toBeVisible({ timeout: 15000 });

  console.log('App shell loaded. Verifying repository list...');

  // Check that "Loading repositories..." is gone
  await expect(page.locator('body')).not.toContainText('Loading repositories...', { timeout: 10000 });

  const cards = page.locator('main h3, main .repository-card');
  const emptyState = page.getByText('No repositories found matching filters.', { exact: true });
  const cardCount = await cards.count();
  const emptyStateVisible = await emptyState.isVisible();

  console.log(`Found ${cardCount} repository elements. Empty state visible: ${emptyStateVisible}.`);
  expect(cardCount > 0 || emptyStateVisible).toBe(true);
  
  console.log('Verification successful. Taking screenshot...');
  await page.screenshot({ path: '../page-verification.png', fullPage: true });
});
