import { test, expect } from '@playwright/test';

test.describe('Studio Initialization & Canvas Sanity', () => {
  test('loads the app and renders canvas with initial elements', async ({ page }) => {
    await page.goto('/');

    // Wait for the studio engine to initialize
    await expect(page.locator('#vsss-artboard-canvas')).toBeVisible({ timeout: 15000 });

    // Verify initial header, hero text, and footer elements are present on canvas
    await expect(page.locator('[data-element-id="elem_header_demo"]')).toBeVisible();
    await expect(page.locator('[data-element-id="elem_hero_header"]')).toBeVisible();
    await expect(page.locator('[data-element-id="elem_footer_demo"]')).toBeVisible();

    // Verify Hero text contains expected text
    const hero = page.locator('[data-element-id="elem_hero_header"]');
    await expect(hero).toContainText('ডিজিটাল ইলেকট্রনিক্স');
    await expect(hero).toContainText('অ্যান্ড গেট');

    // Click on Hero Text to select it
    await hero.click();

    // Inspector should open with Hero Header Block selected
    await expect(page.locator('text=Hero Header Block').first()).toBeVisible();
    await expect(page.locator('button:has-text("Content")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Style")').first()).toBeVisible();
  });
});

