import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import * as RefRangeE2EProtocol from '../../examples/src/sheets/ref-range-e2e.protocol';

interface IStructuralCase {
    name: string;
    axis: RefRangeE2EProtocol.FixtureAxis;
    operation: RefRangeE2EProtocol.FixtureOperation;
    index: number;
}

interface IFixtureRequestArguments {
    eventName: string;
    request: RefRangeE2EProtocol.RefRangeE2ERequest;
}

const STRUCTURAL_CASES: IStructuralCase[] = [
    { name: 'insert row', axis: 'row', operation: 'insert', index: 0 },
    { name: 'delete row', axis: 'row', operation: 'delete', index: 0 },
    { name: 'insert column', axis: 'column', operation: 'insert', index: 0 },
    { name: 'delete column', axis: 'column', operation: 'delete', index: 0 },
];

const POPUP_STRUCTURAL_CASES: IStructuralCase[] = [
    { name: 'insert row before popup', axis: 'row', operation: 'insert', index: 0 },
    { name: 'delete row before popup', axis: 'row', operation: 'delete', index: 0 },
    { name: 'insert column before popup', axis: 'column', operation: 'insert', index: 0 },
    { name: 'delete column before popup', axis: 'column', operation: 'delete', index: 0 },
];

const RANGE_FEATURES = [
    'merge',
    'protection',
    'filter',
    'dataValidation',
    'conditionalFormatting',
] as const;

const POINT_FEATURES = ['hyperlink', 'note', 'comment'] as const;

function executeFixture<T>(page: Page, request: RefRangeE2EProtocol.RefRangeE2ERequest): Promise<T> {
    return page.evaluate<T, IFixtureRequestArguments>(({ eventName, request: fixtureRequest }) => new Promise((resolve, reject) => {
        window.dispatchEvent(new CustomEvent(eventName, {
            detail: { request: fixtureRequest, resolve, reject },
        }));
    }), {
        eventName: RefRangeE2EProtocol.REF_RANGE_E2E_EVENT,
        request,
    });
}

function snapshot(page: Page): Promise<RefRangeE2EProtocol.IFixtureSnapshot> {
    return executeFixture(page, { action: 'snapshot' });
}

function modelSnapshot(value: RefRangeE2EProtocol.IFixtureSnapshot): Omit<RefRangeE2EProtocol.IFixtureSnapshot, 'popupRect'> {
    return {
        merge: value.merge,
        protection: value.protection,
        filter: value.filter,
        dataValidation: value.dataValidation,
        conditionalFormatting: value.conditionalFormatting,
        hyperlink: value.hyperlink,
        note: value.note,
        comment: value.comment,
        dataValidationFormula: value.dataValidationFormula,
        conditionalFormattingRule: value.conditionalFormattingRule,
        hyperlinkUrl: value.hyperlinkUrl,
    };
}

function expectRangeShift(
    before: RefRangeE2EProtocol.IRangeRecord,
    after: RefRangeE2EProtocol.IRangeRecord,
    testCase: IStructuralCase,
    feature: string
): void {
    const offset = testCase.operation === 'insert' ? 1 : -1;
    if (testCase.axis === 'row') {
        expect(after.startRow, `${testCase.name} ${feature} start row`).toBe(before.startRow + offset);
        expect(after.endRow, `${testCase.name} ${feature} end row`).toBe(before.endRow + offset);
        expect(after.startColumn, `${testCase.name} ${feature} start column`).toBe(before.startColumn);
        expect(after.endColumn, `${testCase.name} ${feature} end column`).toBe(before.endColumn);
    } else {
        expect(after.startColumn, `${testCase.name} ${feature} start column`).toBe(before.startColumn + offset);
        expect(after.endColumn, `${testCase.name} ${feature} end column`).toBe(before.endColumn + offset);
        expect(after.startRow, `${testCase.name} ${feature} start row`).toBe(before.startRow);
        expect(after.endRow, `${testCase.name} ${feature} end row`).toBe(before.endRow);
    }
}

function expectPointShift(
    before: RefRangeE2EProtocol.IPointRecord,
    after: RefRangeE2EProtocol.IPointRecord,
    testCase: IStructuralCase,
    feature: string
): void {
    const offset = testCase.operation === 'insert' ? 1 : -1;
    expect(after.row, `${testCase.name} ${feature} row`).toBe(before.row + (testCase.axis === 'row' ? offset : 0));
    expect(after.column, `${testCase.name} ${feature} column`).toBe(before.column + (testCase.axis === 'column' ? offset : 0));
}

function expectPopupMove(
    before: RefRangeE2EProtocol.IRectRecord,
    after: RefRangeE2EProtocol.IRectRecord,
    testCase: IStructuralCase
): void {
    const primaryPosition = testCase.axis === 'row' ? 'top' : 'left';
    const secondaryPosition = testCase.axis === 'row' ? 'left' : 'top';
    const direction = testCase.operation === 'insert' ? 1 : -1;
    expect(Math.sign(after[primaryPosition] - before[primaryPosition]), `${testCase.name} popup direction`).toBe(direction);
    expect(after[secondaryPosition], `${testCase.name} popup orthogonal position`).toBe(before[secondaryPosition]);
    expect(after.width, `${testCase.name} popup width`).toBe(before.width);
    expect(after.height, `${testCase.name} popup height`).toBe(before.height);
}

test('RefRange consumers stay aligned across row and column edits', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.stack ?? error.message));

    await page.setViewportSize({ width: 1600, height: 1200 });
    await page.goto('/sheets/?ref-range-e2e');
    await page.locator(`html[${RefRangeE2EProtocol.REF_RANGE_E2E_READY_ATTRIBUTE}="true"]`).waitFor();
    const initial = await executeFixture<RefRangeE2EProtocol.IFixtureSnapshot>(page, { action: 'setup' });

    for (const testCase of STRUCTURAL_CASES) {
        const before = await snapshot(page);
        await executeFixture<null>(page, { action: 'apply', ...testCase });
        const after = await snapshot(page);

        for (const feature of RANGE_FEATURES) expectRangeShift(before[feature], after[feature], testCase, feature);
        for (const feature of POINT_FEATURES) expectPointShift(before[feature], after[feature], testCase, feature);
        expect(after.dataValidationFormula, `${testCase.name} data validation formula`).not.toBe(before.dataValidationFormula);
        expect(after.conditionalFormattingRule, `${testCase.name} conditional formatting formula`).not.toBe(before.conditionalFormattingRule);
        expect(after.hyperlinkUrl, `${testCase.name} hyperlink target`).not.toBe(before.hyperlinkUrl);
        expect(await executeFixture<boolean>(page, { action: 'undo' })).toBe(true);
        await expect.poll(async () => modelSnapshot(await snapshot(page))).toEqual(modelSnapshot(before));
    }

    await expect.poll(async () => {
        const current = await snapshot(page);
        return current.popupRect.left > 0 && current.popupRect.top > 0;
    }).toBe(true);
    for (const testCase of POPUP_STRUCTURAL_CASES) {
        const before = await snapshot(page);
        await executeFixture<null>(page, { action: 'apply', ...testCase });
        const after = await snapshot(page);
        expectPopupMove(before.popupRect, after.popupRect, testCase);

        expect(await executeFixture<boolean>(page, { action: 'undo' })).toBe(true);
        await expect.poll(() => snapshot(page), { message: `${testCase.name} undo` }).toEqual(before);
    }

    expect(modelSnapshot(await snapshot(page))).toEqual(modelSnapshot(initial));
    expect(pageErrors).toEqual([]);
});
