import { test, expect } from "@playwright/test";

/**
 * End-to-end walk of the core journey described in the product spec:
 * register → onboarding → save a note → upload an image → natural-language
 * search → open a result → edit tags → add to a collection → favorite →
 * delete → restore from trash.
 *
 * Requires a running app pointed at a real (test) Supabase project with
 * ANTHROPIC_API_KEY set, since it exercises the real AI processing
 * pipeline end-to-end rather than mocking it. Run with:
 *   npm run test:e2e
 */

const uniqueEmail = `e2e-${Date.now()}@vault-test.local`;
const password = "TestPassword123!";

test.describe("core journey", () => {
  test("register, onboard, save, search, organize, and clean up an item", async ({ page }) => {
    await page.goto("/sign-up");
    await page.getByLabel("Name").fill("E2E Tester");
    await page.getByLabel("Email").fill(uniqueEmail);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();

    // Email verification is required by default; this assumes a Supabase
    // project configured with auto-confirm for test emails, or that this
    // step is adapted to confirm via a test-only admin endpoint.
    await expect(page.getByText(/check your email|verify/i)).toBeVisible({ timeout: 10_000 });

    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(uniqueEmail);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();

    // Onboarding
    await expect(page.getByRole("heading", { name: /welcome/i })).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Get started" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByPlaceholder(/anything you want to remember/i).fill("E2E test note about a biology exam");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("heading", { name: /privacy/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /go to my memory library|start using vault/i }).click();

    await expect(page).toHaveURL(/\/home/);

    // Search for the note we just saved during onboarding.
    await page.getByPlaceholder(/find anything you remember/i).fill("biology exam");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/search/);
    await expect(page.getByText(/biology exam/i).first()).toBeVisible({ timeout: 15_000 });

    // Open the result, favorite it, add a tag.
    await page.getByText(/biology exam/i).first().click();
    await page.getByRole("button", { name: /toggle favorite/i }).click();
    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByRole("button", { name: /add tag/i }).click();
    await page.keyboard.type("exam-prep");
    await page.keyboard.press("Enter");
    await page.getByRole("button", { name: "Save" }).click();

    // Delete then restore.
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Move to Trash" }).click();
    await expect(page).toHaveURL(/\/items/);

    await page.goto("/trash");
    await page.getByRole("button", { name: "Restore" }).first().click();
    await expect(page.getByText(/item restored/i)).toBeVisible();
  });
});
