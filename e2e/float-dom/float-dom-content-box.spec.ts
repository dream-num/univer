/* eslint-disable no-console */
import type { Page, TestInfo } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

type ContentBoxMode = 'legacy-inset' | 'exact-bounds';
type ClippingCase = 'visible' | 'left-top' | 'right-bottom' | 'offscreen' | 're-entry';

interface IRectRecord {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
}

interface IFloatDomContentBoxEvidence {
    caseId: string;
    mode: ContentBoxMode;
    zoom: number;
    rotation: number;
    clipping: ClippingCase;
    border: boolean;
    logicalRect: IRectRecord;
    placementRect: IRectRecord;
    wrapperRect: IRectRecord;
    contentRect: IRectRecord;
    probeRect: IRectRecord;
    edgeDelta: { top: number; left: number; right: number; bottom: number; max: number };
    legacySnapshotMatched: boolean;
}

const POSITION_BY_CLIPPING: Record<ClippingCase, { left: number; top: number }> = {
    visible: { left: 100, top: 80 },
    'left-top': { left: -240, top: -160 },
    'right-bottom': { left: 700, top: 380 },
    offscreen: { left: 1800, top: 1400 },
    're-entry': { left: 100, top: 80 },
};

function maxEdgeDelta(a: IRectRecord, b: IRectRecord): IFloatDomContentBoxEvidence['edgeDelta'] {
    const edgeDelta = {
        top: Math.abs(a.top - b.top),
        left: Math.abs(a.left - b.left),
        right: Math.abs(a.right - b.right),
        bottom: Math.abs(a.bottom - b.bottom),
        max: 0,
    };
    edgeDelta.max = Math.max(edgeDelta.top, edgeDelta.left, edgeDelta.right, edgeDelta.bottom);
    return edgeDelta;
}

async function configureCase(
    page: Page,
    mode: ContentBoxMode,
    zoom: number,
    rotation: number,
    clipping: ClippingCase,
    border: boolean
): Promise<void> {
    const position = POSITION_BY_CLIPPING[clipping];
    await page.evaluate(({ mode, zoom, rotation, position, border }) => {
        const fixture = window.floatDomContentBoxFixture!;
        const worksheet = window.univerAPI.getActiveWorkbook().getActiveSheet();
        fixture.setMode(mode);
        fixture.setBorder(border);
        worksheet.zoom(zoom);
        worksheet.updateFloatDom(fixture.id, {
            position: {
                left: position.left,
                top: position.top,
                width: 480,
                height: 320,
                angle: rotation,
            },
        });
    }, { mode, zoom, rotation, position, border });
    await page.waitForTimeout(80);
}

async function selectFloatDom(page: Page): Promise<void> {
    const center = await page.locator('[data-float-dom-content-box-probe]').evaluate((probe) => {
        const rect = probe.parentElement!.parentElement!.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });
    await page.mouse.click(center.x, center.y);
    await page.waitForTimeout(50);
}

async function measureCase(
    page: Page,
    caseId: string,
    mode: ContentBoxMode,
    zoom: number,
    rotation: number,
    clipping: ClippingCase,
    border: boolean
): Promise<IFloatDomContentBoxEvidence> {
    return page.evaluate(({ caseId, mode, zoom, rotation, clipping, border }) => {
        const toRect = (rect: DOMRect): IRectRecord => ({
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
        });
        const fixture = window.floatDomContentBoxFixture!;
        const probe = document.querySelector('[data-float-dom-content-box-probe]')! as HTMLDivElement;
        const inner = probe.parentElement! as HTMLDivElement;
        const wrapper = inner.parentElement! as HTMLDivElement;
        const layout = fixture.getLayout()!;
        const logical = window.univerAPI.getActiveWorkbook().getActiveSheet().getFloatDomById(fixture.id).position;

        const placementProbe = document.createElement('div');
        placementProbe.style.position = 'absolute';
        placementProbe.style.pointerEvents = 'none';
        placementProbe.style.top = `${layout.startY}px`;
        placementProbe.style.left = `${layout.startX}px`;
        placementProbe.style.width = `${Math.max(layout.endX - layout.startX, 0)}px`;
        placementProbe.style.height = `${Math.max(layout.endY - layout.startY, 0)}px`;
        placementProbe.style.transform = `rotate(${layout.rotate}deg)`;
        placementProbe.style.transformOrigin = 'center center';
        wrapper.parentElement!.appendChild(placementProbe);

        const placementRect = toRect(placementProbe.getBoundingClientRect());
        const wrapperRect = toRect(wrapper.getBoundingClientRect());
        const contentRect = toRect(inner.getBoundingClientRect());
        const probeRect = toRect(probe.getBoundingClientRect());
        placementProbe.remove();
        const edgeDelta = {
            top: Math.abs(placementRect.top - wrapperRect.top),
            left: Math.abs(placementRect.left - wrapperRect.left),
            right: Math.abs(placementRect.right - wrapperRect.right),
            bottom: Math.abs(placementRect.bottom - wrapperRect.bottom),
            max: 0,
        };
        edgeDelta.max = Math.max(edgeDelta.top, edgeDelta.left, edgeDelta.right, edgeDelta.bottom);

        const record: IFloatDomContentBoxEvidence = {
            caseId,
            mode,
            zoom,
            rotation,
            clipping,
            border,
            logicalRect: {
                left: logical.left,
                top: logical.top,
                right: logical.left + logical.width,
                bottom: logical.top + logical.height,
                width: logical.width,
                height: logical.height,
            },
            placementRect,
            wrapperRect,
            contentRect,
            probeRect,
            edgeDelta,
            legacySnapshotMatched: mode !== 'legacy-inset' || (
                wrapper.style.width === `${Math.max(layout.endX - layout.startX - 2, 0)}px` &&
                wrapper.style.height === `${Math.max(layout.endY - layout.startY - 2, 0)}px` &&
                inner.style.width === `${layout.width - 4}px` &&
                inner.style.height === `${layout.height - 4}px`
            ),
        };
        console.debug(`[DEBUG-float-dom-content-box] ${JSON.stringify(record)}`);
        return record;
    }, { caseId, mode, zoom, rotation, clipping, border });
}

test('FloatDom exact content box browser matrix', async ({ page }, testInfo: TestInfo) => {
    test.setTimeout(180_000);
    page.on('console', (message) => {
        if (message.text().startsWith('[DEBUG-float-dom-content-box]')) {
            console.log(message.text());
        }
    });
    page.on('pageerror', (error) => console.error(`[PAGE-ERROR] ${error.stack ?? error.message}`));

    await page.setViewportSize({ width: 1600, height: 1200 });
    await page.goto('/sheets/?float-dom-content-box');
    await page.evaluate(() => window.E2EControllerAPI.loadDefaultSheet());
    await page.waitForTimeout(1_000);
    await page.waitForFunction(() => Boolean(window.floatDomContentBoxFixture && document.querySelector('[data-float-dom-content-box-probe]')), undefined, { timeout: 15_000 });

    const zooms = [0.75, 1, 1.25, 2];
    const rotations = [0, 30];
    const clippings: ClippingCase[] = ['visible', 'left-top', 'right-bottom', 'offscreen', 're-entry'];
    const records: IFloatDomContentBoxEvidence[] = [];

    for (const zoom of zooms) {
        for (const rotation of rotations) {
            for (const clipping of clippings) {
                for (const border of [false, true]) {
                    for (const mode of ['legacy-inset', 'exact-bounds'] as const) {
                        const caseId = `${mode}-z${zoom}-r${rotation}-${clipping}-${border ? 'border' : 'no-border'}`;
                        await configureCase(page, mode, zoom, rotation, clipping, border);
                        const record = await measureCase(page, caseId, mode, zoom, rotation, clipping, border);
                        records.push(record);

                        expect(record.logicalRect.width, caseId).toBe(480);
                        expect(record.logicalRect.height, caseId).toBe(320);
                        expect(record.legacySnapshotMatched, caseId).toBe(true);
                        expect(maxEdgeDelta(record.contentRect, record.probeRect).max, caseId).toBeLessThanOrEqual(0.5);
                        if (mode === 'exact-bounds') {
                            expect(record.edgeDelta.max, caseId).toBeLessThanOrEqual(0.5);
                            if (clipping === 'visible' || clipping === 're-entry') {
                                expect(maxEdgeDelta(record.wrapperRect, record.contentRect).max, caseId).toBeLessThanOrEqual(0.5);
                            }
                        }
                    }
                }
            }
        }
    }

    const evidencePath = testInfo.outputPath('float-dom-content-box-evidence.json');
    await writeFile(evidencePath, JSON.stringify(records, null, 2));
    await testInfo.attach('float-dom-content-box-evidence', { path: evidencePath, contentType: 'application/json' });
    await page.screenshot({
        path: testInfo.outputPath('float-dom-content-box-re-entry.png'),
        fullPage: true,
    });
});

test('exact content box preserves transformer rendering and pointer resize/rotate behavior', async ({ page }, testInfo: TestInfo) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1600, height: 1200 });
    await page.goto('/sheets/?float-dom-content-box');
    await page.evaluate(() => window.E2EControllerAPI.loadDefaultSheet());
    await page.waitForFunction(() => Boolean(window.floatDomContentBoxFixture && document.querySelector('[data-float-dom-content-box-probe]')));

    const canvas = page.locator('canvas[id^="univer-sheet-main-canvas_"]');
    const canvasPixelHash = () => page.locator('canvas[id^="univer-sheet-main-canvas_"]').evaluate((element: HTMLCanvasElement) => {
        const pixels = element.getContext('2d')!.getImageData(0, 0, element.width, element.height).data;
        let hash = 2166136261;
        for (let i = 0; i < pixels.length; i++) {
            hash ^= pixels[i];
            hash = Math.imul(hash, 16777619);
        }
        return { hash: hash >>> 0, width: element.width, height: element.height };
    });
    for (const zoom of [0.75, 1, 1.25, 2]) {
        for (const rotation of [0, 30]) {
            await configureCase(page, 'legacy-inset', zoom, rotation, 'visible', false);
            await selectFloatDom(page);
            const legacyHash = await canvasPixelHash();
            const legacyCanvas = await canvas.screenshot();
            await page.evaluate(() => window.floatDomContentBoxFixture!.setMode('exact-bounds'));
            await page.waitForTimeout(50);
            const exactHash = await canvasPixelHash();
            const exactCanvas = await canvas.screenshot();
            expect(exactHash, `transformer canvas z${zoom} r${rotation}`).toEqual(legacyHash);

            if (zoom === 1 && rotation === 0) {
                const legacyPath = testInfo.outputPath('transformer-legacy.png');
                const exactPath = testInfo.outputPath('transformer-exact.png');
                await writeFile(legacyPath, legacyCanvas);
                await writeFile(exactPath, exactCanvas);
                await testInfo.attach('transformer-legacy', { path: legacyPath, contentType: 'image/png' });
                await testInfo.attach('transformer-exact', { path: exactPath, contentType: 'image/png' });
            }
        }
    }

    const resizeTargets = [
        { name: 'left-top', x: 0, y: 0 },
        { name: 'center-top', x: 0.5, y: 0 },
        { name: 'right-top', x: 1, y: 0 },
        { name: 'left-middle', x: 0, y: 0.5 },
        { name: 'right-middle', x: 1, y: 0.5 },
        { name: 'left-bottom', x: 0, y: 1 },
        { name: 'center-bottom', x: 0.5, y: 1 },
        { name: 'right-bottom', x: 1, y: 1 },
    ];
    const pointerResults: Array<{ target: string; hit: boolean; action: string; cursor: string }> = [];

    for (const target of resizeTargets) {
        await configureCase(page, 'exact-bounds', 1, 0, 'visible', false);
        await selectFloatDom(page);
        const rect = await page.locator('[data-float-dom-content-box-probe]').evaluate((probe) => {
            const value = probe.parentElement!.parentElement!.getBoundingClientRect();
            return { left: value.left, top: value.top, width: value.width, height: value.height };
        });
        // Aim inside the visible anchor hit area. Pointer movement reaches the
        // canvas through FloatDom's event-forwarding boundary.
        const startX = target.x === 0
            ? rect.left + 2
            : target.x === 1
                ? rect.left + rect.width - 2
                : rect.left + rect.width / 2;
        const startY = target.y === 0
            ? rect.top + 2
            : target.y === 1
                ? rect.top + rect.height - 2
                : rect.top + rect.height / 2;
        await page.mouse.move(startX, startY);
        await page.waitForTimeout(20);
        const cursor = await canvas.evaluate((element) => getComputedStyle(element).cursor);

        const result = await page.evaluate(() => {
            const fixture = window.floatDomContentBoxFixture!;
            const logical = window.univerAPI.getActiveWorkbook().getActiveSheet().getFloatDomById(fixture.id).position;
            const probe = document.querySelector('[data-float-dom-content-box-probe]')!;
            const innerRect = probe.parentElement!.getBoundingClientRect();
            const wrapperRect = probe.parentElement!.parentElement!.getBoundingClientRect();
            return {
                logical,
                alignment: Math.max(
                    Math.abs(innerRect.left - wrapperRect.left),
                    Math.abs(innerRect.top - wrapperRect.top),
                    Math.abs(innerRect.right - wrapperRect.right),
                    Math.abs(innerRect.bottom - wrapperRect.bottom)
                ),
            };
        });
        const hit = cursor.includes('resize');
        pointerResults.push({ target: target.name, hit, action: 'resize', cursor });
        expect(hit, target.name).toBe(true);
        expect(result.logical.width, `${target.name} logical width`).toBe(480);
        expect(result.logical.height, `${target.name} logical height`).toBe(320);
        expect(result.alignment, `${target.name} DOM alignment`).toBeLessThanOrEqual(0.5);
    }

    await configureCase(page, 'exact-bounds', 1, 0, 'visible', false);
    await selectFloatDom(page);
    await page.evaluate(() => window.floatDomContentBoxFixture!.enableRotateHandle());
    await page.waitForTimeout(20);
    const rotateStart = await page.locator('[data-float-dom-content-box-probe]').evaluate((probe) => {
        const rect = probe.parentElement!.parentElement!.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top - 57 };
    });
    let rotateCursor = 'default';
    for (let offsetY = -8; offsetY <= 8 && rotateCursor !== 'move'; offsetY += 2) {
        for (let offsetX = -8; offsetX <= 8 && rotateCursor !== 'move'; offsetX += 2) {
            await page.mouse.move(rotateStart.x + offsetX, rotateStart.y + offsetY);
            rotateCursor = await canvas.evaluate((element) => getComputedStyle(element).cursor);
        }
    }
    const rotateHit = rotateCursor === 'move';
    pointerResults.push({ target: 'rotate', hit: rotateHit, action: 'rotate', cursor: rotateCursor });
    expect(rotateHit).toBe(true);
    console.debug(`[DEBUG-float-dom-content-box] ${JSON.stringify({ caseId: 'transformer-pointer-interactions', pointerResults })}`);
    const pointerResultsPath = testInfo.outputPath('float-dom-pointer-results.json');
    await writeFile(pointerResultsPath, JSON.stringify(pointerResults, null, 2));
    await testInfo.attach('float-dom-pointer-results', { path: pointerResultsPath, contentType: 'application/json' });
});
