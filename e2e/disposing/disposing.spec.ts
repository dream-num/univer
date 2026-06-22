import { expect, test } from '@playwright/test';

test('no error on constructing and disposing', async ({ page }) => {
    let errored = false;

    page.on('pageerror', (error) => {
        console.error('Page error:', error);
        errored = true;
    });

    await page.goto('http://localhost:3000/sheets/');
    await page.evaluate(() => window.E2EControllerAPI.loadDemoSheet());
    await page.evaluate(() => window.E2EControllerAPI.disposeCurrSheetUnit());

    await page.evaluate(() => window.E2EControllerAPI.loadDemoSheet(0));
    await page.evaluate(() => window.E2EControllerAPI.disposeCurrSheetUnit(0));

    await page.evaluate(() => window.E2EControllerAPI.loadDemoSheet(2000));
    await page.evaluate(() => window.E2EControllerAPI.disposeCurrSheetUnit(0));

    await page.evaluate(() => window.E2EControllerAPI.disposeUniver());
    expect(errored).toBeFalsy();
});

test('no error on constructing and disposing sheet unit', async ({ page }) => {
    test.setTimeout(40 * 1000); // setTimeout(0) means Keep wait result forever

    let errored = false;
    page.on('pageerror', (error) => {
        console.error('Page error:', error);
        errored = true;
    });

    await page.goto('http://localhost:3000/sheets/');
    await page.evaluate(() => window.E2EControllerAPI.disposeCurrSheetUnit());
    await page.evaluate(() => window.E2EControllerAPI.loadDemoSheet());

    await page.evaluate(() => window.E2EControllerAPI.disposeCurrSheetUnit(0));
    await page.evaluate(() => window.E2EControllerAPI.loadDemoSheet(0));

    await page.evaluate(() => window.E2EControllerAPI.disposeCurrSheetUnit(500));
    await page.evaluate(() => window.E2EControllerAPI.loadDemoSheet(1000));

    await page.evaluate(() => window.E2EControllerAPI.disposeCurrSheetUnit(3000));
    await page.evaluate(() => window.E2EControllerAPI.loadDemoSheet(1000));
    await page.evaluate(() => window.E2EControllerAPI.disposeUniver());

    expect(errored).toBeFalsy();
});

test('no error when dispose a unit', async ({ page }) => {
    let errored = false;

    page.on('pageerror', (error) => {
        console.error('Page error:', error);
        errored = true;
    });

    await page.goto('http://localhost:3000/sheets/');
    await page.evaluate(() => window.E2EControllerAPI.loadAndRelease(1));
    await page.evaluate(() => window.E2EControllerAPI.loadAndRelease(2));

    await page.evaluate(() => window.E2EControllerAPI.loadAndRelease(1, 1000, 1000));
    await page.evaluate(() => window.E2EControllerAPI.loadAndRelease(2, 1000, 1000));

    expect(errored).toBeFalsy();
});
