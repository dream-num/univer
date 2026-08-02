import { expect, test } from '@playwright/test';

const DRAWING_SELECTED_OPERATION_ID = 'drawing.operation.set-drawing-selected';
const SHAPE_SOURCE = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="144" height="96"><rect x="4" y="4" width="136" height="88" rx="14" fill="#3A60F7" stroke="#1D3EA6" stroke-width="4" /></svg>')}`;
const WRAPPING_STYLES = [
    'WRAP_SQUARE',
    'WRAP_TOP_AND_BOTTOM',
    'BEHIND_TEXT',
    'IN_FRONT_OF_TEXT',
] as const;

for (const wrappingStyle of WRAPPING_STYLES) {
    test(`restores drawing layout across undo and redo for ${wrappingStyle}`, async ({ page }) => {
        await page.goto('/docs/');
        await page.evaluate(() => window.E2EControllerAPI.loadDefaultDoc(0));
        const drawing = await page.evaluate(async ({ selectedOperationId, source }) => {
            const document = window.univerAPI.getActiveDocument();
            const image = await document.insertImage({
                source,
                imageSourceType: window.univerAPI.Enum.ImageSourceType.BASE64,
                width: 144,
                height: 96,
                wrappingStyle: window.univerAPI.Enum.TextWrappingStyle.INLINE,
                textRange: { startOffset: 50, endOffset: 50, collapsed: true, segmentId: '' },
            });
            if (!image) {
                throw new Error('Failed to insert the E2E drawing');
            }
            const unitId = document.getId();
            const drawingId = image.getId();
            await window.univerAPI.executeCommand(selectedOperationId, [{
                unitId,
                subUnitId: unitId,
                drawingId,
            }]);
            return { drawingId };
        }, { selectedOperationId: DRAWING_SELECTED_OPERATION_ID, source: SHAPE_SOURCE });
        await page.waitForTimeout(500);

        const clip = { x: 240, y: 300, width: 800, height: 300 };
        const inline = await page.screenshot({ clip });

        await page.evaluate(({ drawingId, style }) => {
            const image = window.univerAPI.getActiveDocument().getImage(drawingId);
            if (!image?.setWrappingStyle(window.univerAPI.Enum.TextWrappingStyle[style])) {
                throw new Error(`Failed to set ${style} wrapping style`);
            }
        }, { drawingId: drawing.drawingId, style: wrappingStyle });
        await page.waitForTimeout(500);
        const wrapped = await page.screenshot({ clip });
        expect(wrapped.equals(inline)).toBe(false);

        await page.evaluate(() => window.univerAPI.undo());
        await page.waitForTimeout(500);
        expect((await page.screenshot({ clip })).equals(inline)).toBe(true);

        await page.evaluate(() => window.univerAPI.redo());
        await page.waitForTimeout(500);
        expect((await page.screenshot({ clip })).equals(wrapped)).toBe(true);
    });
}
