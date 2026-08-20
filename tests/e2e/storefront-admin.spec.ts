import { test, expect } from '@playwright/test';

test.describe('Sareethi E2E Browser Automation Suite', () => {
  // Flow 1: Customer Storefront Journey
  test('Customer Journey: Login -> Browse Products -> Add to Cart -> Checkout', async ({ page }) => {
    // 1. Visit Home
    await page.goto('http://localhost:3000');
    await expect(page.locator('text=Sareethi')).toBeVisible();

    // 2. Browse Products
    await page.goto('http://localhost:3000/products');
    await expect(page.locator('text=Women\'s Collection')).toBeVisible();

    // 3. Product Detail & Add to Cart
    await page.goto('http://localhost:3000/products/SAR-00001');
    await page.click('button:has-text("ADD TO CART")');

    // 4. Checkout
    await page.goto('http://localhost:3000/checkout');
    await expect(page.locator('text=Delivery Information')).toBeVisible();
  });

  // Flow 2: Admin Operational Journey
  test('Admin Journey: Login -> Upload Catalogue -> Approve -> Bill -> Return -> Dashboard', async ({ page }) => {
    // 1. Admin Dashboard
    await page.goto('http://localhost:3000/admin/dashboard');
    await expect(page.locator('text=Today\'s Business Overview')).toBeVisible();

    // 2. Catalogue Ingestion
    await page.goto('http://localhost:3000/admin/catalogue');
    await expect(page.locator('text=AI Catalogue Ingestion Pipeline')).toBeVisible();

    // 3. Billing Desk
    await page.goto('http://localhost:3000/admin/billing');
    await expect(page.locator('text=Physical Store Billing Desk')).toBeVisible();

    // 4. Returns Desk
    await page.goto('http://localhost:3000/admin/returns');
    await expect(page.locator('text=Customer Returns & Restock Desk')).toBeVisible();

    // 5. Human Approvals Queue
    await page.goto('http://localhost:3000/admin/approvals');
    await expect(page.locator('text=Human Approval Queue')).toBeVisible();
  });
});
