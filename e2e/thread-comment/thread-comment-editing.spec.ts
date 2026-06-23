import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { generateSnapshotName } from '../visual-comparison/const';

test.use({ viewport: { width: 1400, height: 900 } });

const DOC_INITIAL_COMMENT = 'doc e2e comment';
const DOC_UPDATED_COMMENT = 'doc e2e comment updated';
const SHEET_INITIAL_COMMENT = 'sheet e2e comment';
const SHEET_UPDATED_COMMENT = 'sheet e2e comment updated';

function collectPageErrors(page: Page) {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
        errors.push(error.stack || error.message);
    });

    return errors;
}

async function waitForUniverCanvas(page: Page) {
    await page.waitForFunction(() => document.querySelectorAll('canvas').length > 0, undefined, { timeout: 30_000 });
}

async function waitForE2EController(page: Page) {
    await page.waitForFunction(() => Boolean(window.E2EControllerAPI), undefined, { timeout: 30_000 });
}

async function getCommentEditorText(page: Page) {
    return page.evaluate(() => {
        const univer = window.univer;
        if (!univer?.__getInjector) {
            return null;
        }

        const injector = univer.__getInjector();
        const editorServiceToken = [...injector.dependencyCollection.dependencyMap.keys()]
            .find((token) => String(token) === 'univer.editor.service');
        if (!editorServiceToken) {
            return null;
        }

        const editorService = injector.get(editorServiceToken);
        const editors = editorService.getAllEditor();
        const editorList = Array.isArray(editors)
            ? editors
            : editors instanceof Map
                ? [...editors.values()]
                : [...editors];
        const commentEditor = editorList.find((editor) => String(editor.getEditorId?.() || editor.getId?.()).includes('COMMENT_EDITOR'));
        const dataStream = commentEditor?.getDocumentData?.().body?.dataStream;

        return typeof dataStream === 'string' ? dataStream.replace(/\r\n$/, '') : null;
    });
}

async function expectCommentEditorText(page: Page, text: string) {
    await expect.poll(() => getCommentEditorText(page), { timeout: 5_000 }).toBe(text);
}

async function getThreadCommentCardId(page: Page, commentText: string) {
    const id = await page.evaluate((text) => {
        const commentCard = [...document.querySelectorAll<HTMLElement>('[id^="PANEL-"]')]
            .find((element) => element.textContent?.includes(text));

        return commentCard?.id ?? null;
    }, commentText);

    expect(id).not.toBeNull();

    return id!;
}

async function clickThreadMoreMenu(page: Page, commentText: string) {
    const cardId = await getThreadCommentCardId(page, commentText);
    const card = page.locator(`[id="${cardId}"]`);

    await card.locator('[class*="univer-cursor-pointer"]').last().click();

    return card;
}

async function editCommentFromThread(page: Page, originalText: string, updatedText: string, locale: 'zh' | 'en', snapshotName?: string) {
    const card = await clickThreadMoreMenu(page, originalText);
    await page.getByText(locale === 'zh' ? '编辑' : 'Edit', { exact: true }).last().click();

    await expectCommentEditorText(page, originalText);
    if (snapshotName) {
        await expect(card).toHaveScreenshot(generateSnapshotName(snapshotName), {
            maxDiffPixels: 100,
            mask: [
                card.locator(':scope > div').first(),
                card.locator('time'),
            ],
        });
    }

    await page.keyboard.type(' updated');
    await expectCommentEditorText(page, updatedText);
    await page.getByRole('button', { name: locale === 'zh' ? '保存' : 'Save' }).last().click();
    await expect(page.getByText(updatedText).first()).toBeVisible({ timeout: 5_000 });

    await clickThreadMoreMenu(page, updatedText);
    await page.getByText(locale === 'zh' ? '编辑' : 'Edit', { exact: true }).last().click();
    await expectCommentEditorText(page, updatedText);
}

test('docs comment keeps content visible while editing, saves, and edits again', async ({ page }) => {
    const errors = collectPageErrors(page);

    await page.goto('/docs/');
    await waitForE2EController(page);
    await page.evaluate(() => window.E2EControllerAPI.loadDefaultDoc());
    await waitForUniverCanvas(page);
    await page.waitForTimeout(2_000);

    await page.mouse.move(370, 195);
    await page.mouse.down();
    await page.mouse.move(740, 195, { steps: 20 });
    await page.mouse.up();
    await page.locator('[data-u-command="docs.operation.start-add-comment"]').last().click();

    await page.mouse.click(1220, 285);
    await page.keyboard.type(DOC_INITIAL_COMMENT);
    await page.getByRole('button', { name: '回复' }).last().click();
    await expect(page.getByText(DOC_INITIAL_COMMENT)).toBeVisible({ timeout: 5_000 });

    await editCommentFromThread(page, DOC_INITIAL_COMMENT, DOC_UPDATED_COMMENT, 'zh', 'doc-comment-editing');

    expect(errors).toEqual([]);
});

test('sheets comment keeps content visible while editing, saves, and edits again', async ({ page }) => {
    const errors = collectPageErrors(page);

    await page.goto('/sheets/');
    await waitForE2EController(page);
    await page.evaluate(() => window.E2EControllerAPI.loadDefaultSheet());
    await waitForUniverCanvas(page);
    await page.waitForTimeout(2_000);
    await page.evaluate(async (commentText) => {
        const workbook = window.univerAPI.getActiveWorkbook();
        const worksheet = workbook.getActiveSheet();
        const range = worksheet.getRange('A1');
        await range.addCommentAsync(window.univerAPI.newTheadComment().setContent(window.univerAPI.newRichText().insertText(commentText)));
        await window.univerAPI.executeCommand('sheet.operation.toggle-comment-panel');
    }, SHEET_INITIAL_COMMENT);

    await expect(page.getByText(SHEET_INITIAL_COMMENT)).toBeVisible({ timeout: 5_000 });
    await editCommentFromThread(page, SHEET_INITIAL_COMMENT, SHEET_UPDATED_COMMENT, 'en', 'sheet-comment-editing');

    expect(errors).toEqual([]);
});
