import { expect, test } from '@playwright/test';

const os = require('os');
/**
 * Delay for a number of milliseconds
 */
function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

function osType() {
    if (os.type() == 'Windows_NT') {
        //windows
        return 'windows';
    } else if (os.type() == 'Darwin') {
        //mac
        return 'mac';
    } else if (os.type() == 'Linux') {
        //Linux
        return 'linux';
    } else {
        //Prompt not supported
        return '';
    }
}

/**
 * Use Playwright to test UI
 */
test.describe('UniverSheet E2E Test with Playwright', () => {
    test.beforeEach(async ({ page }) => {
        // Go to the starting url before each test.
        await page.goto('http://localhost:3103/');
        sleep(3000);
    });

    test('Test color picker Components', async ({ page }) => {
        // click color picker arrow
        await page.$$eval('.univer-tooltip-grop', (elHandles) => {
            elHandles.forEach((el, i) => {
                if (i === 8) {
                    (el as HTMLElement).click();
                }
            });
        });
        // click red circle button
        await page.$$eval('.univer-picker-swatch-btn', (elHandles) => {
            elHandles.forEach((el, i) => {
                if (i === 8) {
                    (el as HTMLElement).click();
                }
            });
        });

        // get selected color
        const color = await page.evaluate((el) => window.getComputedStyle(el as Element).backgroundColor, await page.$('.univer-select-color'));
        expect(color).toEqual('rgb(255, 0, 0)');

        await page.screenshot({ path: 'screenshot/clicks_color_picker.png' });
    });

    test('Test select input Components', async ({ page }) => {
        const Element = await page.$('.univer-select-input .univer-input.univer-input-borderless');
        await Element?.click();
        if (osType() === 'windows') {
            await page.keyboard.press('Control+A');
        } else if (osType() === 'mac') {
            await page.keyboard.press('Meta+A');
        }

        await page.keyboard.press('Backspace');
        await Element?.type('24');
        const fontsize = await page.evaluate((el) => (el as HTMLInputElement).value, await page.$('.univer-select-input .univer-input.univer-input-borderless'));
        expect(fontsize).toEqual('24');
    });
});
