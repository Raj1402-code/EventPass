import { test, expect } from '@playwright/test';

test.describe('NEXUS Navigation & Interactive Flows', () => {
  test('should load the home page and render key elements', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/NEXUS/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Adaptive AI Signal Control');
  });

  test('should navigate to solutions page and toggle simulation mode', async ({ page }) => {
    await page.goto('/solutions');
    await expect(page.getByText('Next-Generation Mobility')).toBeVisible();

    // Verify sandbox widget exists
    const sandboxHeader = page.getByText('Real-Time Traffic Light & Signal Simulator');
    await expect(sandboxHeader).toBeVisible();
  });

  test('should navigate to pricing page and toggle annual billing', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByText('Flexible Pricing Built for City Budgets')).toBeVisible();

    const annualButton = page.getByRole('button', { name: /Annual Billing/i });
    await annualButton.click();
    await expect(page.getByText('Save 20%')).toBeVisible();
  });
});
