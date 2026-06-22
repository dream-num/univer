import { expect, test } from '@playwright/test';

test('ensure sheets-multi boots up without errors', async ({ page }) => {
    let errored = false;

    page.on('pageerror', (error) => {
        console.error('Page error:', error);
        errored = true;
    });

    await page.goto('http://localhost:3000/sheets-multi/');
    await page.waitForTimeout(10000);

    expect(errored).toBeFalsy();
});
