import type { ICellData, IDocumentBody, IWorkbookData, IWorksheetData } from '@univerjs/core';
import { BooleanNumber, CustomRangeType, LocaleType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';

import { readGeneratedSvgSize } from '../../generated-svg';
import { createSheetFixture } from '../create-sheet-fixture';

interface ISheetDrawingAnchorPoint {
    column: number;
    columnOffset: number;
    row: number;
    rowOffset: number;
}

interface ISheetDrawingFixture {
    sheetTransform: {
        from: ISheetDrawingAnchorPoint;
        to: ISheetDrawingAnchorPoint;
    };
    source: string;
    transform: {
        height: number;
        width: number;
    };
}

const PRESET_SAMPLES = [
    ['core', 'Core'],
    ['conditional-formatting', 'Conditional Formatting'],
    ['data-validation', 'Data Validation'],
    ['drawing', 'Drawing'],
    ['filter', 'Filter'],
    ['find-replace', 'Find & Replace'],
    ['hyper-link', 'Hyperlink'],
    ['note', 'Note'],
    ['sort', 'Sort'],
    ['table', 'Table'],
    ['thread-comment', 'Thread Comment'],
] as const;

function parseResource(fixture: IWorkbookData, name: string): unknown {
    const resource = fixture.resources?.find((item) => item.name === name);
    if (!resource) {
        throw new Error(`Missing fixture resource: ${name}`);
    }
    return JSON.parse(resource.data) as unknown;
}

function collectCells(fixture: IWorkbookData, sheetId: string): ICellData[] {
    const rows = Object.values(fixture.sheets[sheetId].cellData ?? {});
    return rows.flatMap((row) => Object.values(row ?? {}) as Array<ICellData | null>).filter(
        (cell): cell is ICellData => cell !== null
    );
}

function getColumnPosition(sheet: Partial<IWorksheetData>, columnIndex: number): number {
    if (sheet.defaultColumnWidth == null) {
        throw new Error('Drawing fixture must define a default column width.');
    }

    let position = 0;
    for (let column = 0; column < columnIndex; column++) {
        position += sheet.columnData?.[column]?.w ?? sheet.defaultColumnWidth;
    }
    return position;
}

function getRowPosition(sheet: Partial<IWorksheetData>, rowIndex: number): number {
    if (sheet.defaultRowHeight == null) {
        throw new Error('Drawing fixture must define a default row height.');
    }

    let position = 0;
    for (let row = 0; row < rowIndex; row++) {
        position += sheet.rowData?.[row]?.h ?? sheet.defaultRowHeight;
    }
    return position;
}

function getDrawingAnchorSize(sheet: Partial<IWorksheetData>, drawing: ISheetDrawingFixture) {
    const { from, to } = drawing.sheetTransform;
    return {
        height: getRowPosition(sheet, to.row) + to.rowOffset - getRowPosition(sheet, from.row) - from.rowOffset,
        width: getColumnPosition(sheet, to.column) + to.columnOffset
            - getColumnPosition(sheet, from.column) - from.columnOffset,
    };
}

describe('createSheetFixture', () => {
    it('creates one deterministic, discoverable sample for every registered preset', () => {
        const first = createSheetFixture(LocaleType.AR_SA, 'rtl');
        const second = createSheetFixture(LocaleType.AR_SA, 'rtl');
        const expectedIds = PRESET_SAMPLES.map(([id]) => id);

        expect(first.sheetOrder).toEqual(expectedIds);
        expect(Object.keys(first.sheets)).toEqual(expectedIds);
        expect(PRESET_SAMPLES.map(([id]) => [id, first.sheets[id].name])).toEqual(PRESET_SAMPLES);
        expect(Object.values(first.sheets).every(({ rightToLeft }) => rightToLeft === BooleanNumber.TRUE)).toBe(true);
        expect(Object.values(first.sheets).every(({ tabColor }) => Boolean(tabColor))).toBe(true);
        expect(PRESET_SAMPLES.every(([id]) => {
            const guide = first.sheets[id].cellData?.[1]?.[0]?.v;
            return typeof guide === 'string'
                && guide.length > 20
                && /edit|open|move|find|select|use|hover/i.test(guide);
        })).toBe(true);
        expect(first.sheets).not.toBe(second.sheets);
        expect(JSON.stringify(first)).toBe(JSON.stringify(second));
        expect(JSON.stringify(first).length).toBeLessThan(80_000);
        expect(JSON.stringify(first)).not.toMatch(/collaboration/i);
    });

    it('applies the selected default zoom to every sample sheet', () => {
        const defaultFixture = createSheetFixture(LocaleType.EN_US, 'ltr');
        const zoomedFixture = createSheetFixture(LocaleType.EN_US, 'ltr', 1.25);

        expect(Object.values(defaultFixture.sheets).every(({ zoomRatio }) => zoomRatio === 1)).toBe(true);
        expect(Object.values(zoomedFixture.sheets).every(({ zoomRatio }) => zoomRatio === 1.25)).toBe(true);
    });

    it('provides real core and command-preset interaction targets', () => {
        const fixture = createSheetFixture(LocaleType.EN_US, 'ltr');
        const core = fixture.sheets.core;
        const formulas = collectCells(fixture, 'core').flatMap(({ f }) => f ? [f] : []);
        const formulaFunctions = new Set(formulas.flatMap((formula) => formula.match(/[A-Z]+(?=\()/g) ?? []));
        const findTargets = collectCells(fixture, 'find-replace')
            .map(({ v }) => v)
            .filter((value): value is string => typeof value === 'string' && /workbench/i.test(value));
        const hyperlink = fixture.sheets['hyper-link'].cellData?.[4]?.[1];
        const sortOrder = [4, 5, 6, 7, 8].map((row) => fixture.sheets.sort.cellData?.[row]?.[0]?.v);

        expect([...formulaFunctions]).toEqual(expect.arrayContaining([
            'SUM',
            'SUMIFS',
            'IF',
            'COUNTIF',
            'XLOOKUP',
            'TEXTJOIN',
            'WORKDAY',
            'DATE',
            'IFERROR',
            'SEQUENCE',
            'FILTER',
        ]));
        expect(formulas.some((formula) => formula.includes('TableRevenue'))).toBe(true);
        expect(formulas.some((formula) => formula.includes("'Table'!"))).toBe(true);
        expect(core.cellData?.[21]?.[5]?.p?.body?.textRuns).toHaveLength(4);
        expect(core.mergeData).toContainEqual({ startRow: 25, endRow: 25, startColumn: 0, endColumn: 7 });
        expect(core.rowData?.[29]?.hd).toBe(BooleanNumber.TRUE);
        expect(core.columnData?.[10]?.hd).toBe(BooleanNumber.TRUE);
        expect(core.freeze).toEqual({ xSplit: 0, ySplit: 3, startColumn: 0, startRow: 3 });
        expect(core.showGridlines).toBe(BooleanNumber.FALSE);
        expect(Object.values(fixture.styles ?? {}).filter((style) => style?.n).length).toBeGreaterThanOrEqual(9);
        expect(core.cellData?.[18]?.[5]?.s).toBe('wrapped');
        expect(core.cellData?.[18]?.[6]?.s).toBe('rotated');
        expect(core.cellData?.[21]?.[3]?.s).toBe('borderDiagonal');
        expect(findTargets).toHaveLength(5);
        expect(hyperlink?.p?.body?.customRanges?.[0]).toMatchObject({
            rangeType: CustomRangeType.HYPERLINK,
            properties: { url: 'https://docs.univer.ai' },
        });
        expect(sortOrder).toEqual(['Gamma', 'Alpha', 'Zeta', 'Beta', 'Delta']);
    });

    it('binds every resource-backed preset exclusively to its matching sample tab', () => {
        const fixture = createSheetFixture(LocaleType.EN_US, 'ltr');
        const validation = parseResource(fixture, 'SHEET_DATA_VALIDATION_PLUGIN') as Record<
            string,
            Array<{ type: string }>
        >;
        const conditionalFormatting = parseResource(fixture, 'SHEET_CONDITIONAL_FORMATTING_PLUGIN') as Record<
            string,
            Array<{ rule: { subType?: string; type: string } }>
        >;
        const drawings = parseResource(fixture, 'SHEET_DRAWING_PLUGIN') as Record<
            string,
            { data: Record<string, ISheetDrawingFixture>; order: string[] }
        >;
        const comments = parseResource(fixture, 'SHEET_UNIVER_THREAD_COMMENT_PLUGIN') as Record<
            string,
            Array<{ children: Array<{ text: IDocumentBody }>; text: IDocumentBody }>
        >;
        const filters = parseResource(fixture, 'SHEET_FILTER_PLUGIN') as Record<
            string,
            { ref: { endColumn: number; endRow: number; startColumn: number; startRow: number } }
        >;
        const notes = parseResource(fixture, 'SHEET_NOTE_PLUGIN') as Record<string, unknown>;
        const tables = parseResource(fixture, 'SHEET_TABLE_PLUGIN') as Record<
            string,
            { tables: Array<{ range: { endColumn: number; endRow: number; startColumn: number; startRow: number } }> }
        >;

        expect(Object.keys(validation)).toEqual(['data-validation']);
        expect(Object.keys(conditionalFormatting)).toEqual(['conditional-formatting']);
        expect(Object.keys(drawings)).toEqual(['drawing']);
        expect(Object.keys(filters)).toEqual(['filter']);
        expect(Object.keys(notes)).toEqual(['note']);
        expect(Object.keys(tables)).toEqual(['table']);
        expect(Object.keys(comments)).toEqual(['thread-comment']);
        expect(new Set(validation['data-validation'].map(({ type }) => type))).toEqual(new Set([
            'list',
            'textLength',
            'whole',
            'decimal',
            'custom',
            'date',
            'checkbox',
            'listMultiple',
        ]));
        expect(conditionalFormatting['conditional-formatting'].map(({ rule }) => rule.type)).toEqual(expect.arrayContaining([
            'dataBar',
            'colorScale',
            'iconSet',
            'highlightCell',
        ]));
        expect(conditionalFormatting['conditional-formatting'].map(({ rule }) => rule.subType)).toEqual(expect.arrayContaining([
            'text',
            'duplicateValues',
            'rank',
        ]));
        expect(filters.filter.ref).toEqual({ startRow: 3, endRow: 9, startColumn: 0, endColumn: 12 });
        expect(tables.table.tables[0].range).toEqual({ startRow: 3, endRow: 9, startColumn: 0, endColumn: 12 });
        expect(drawings.drawing.order).toHaveLength(2);
        expect(Object.values(drawings.drawing.data).every(({ source }) => source.startsWith('data:image/svg+xml')))
            .toBe(true);
        Object.values(drawings.drawing.data).forEach((drawing) => {
            const intrinsicSize = readGeneratedSvgSize(drawing.source);
            const anchorSize = getDrawingAnchorSize(fixture.sheets.drawing, drawing);

            expect(drawing.transform.width / drawing.transform.height).toBeCloseTo(
                intrinsicSize.width / intrinsicSize.height,
                8
            );
            expect(anchorSize).toEqual(intrinsicSize);
        });
        expect(comments['thread-comment'][0].children).toHaveLength(1);
        expect([
            comments['thread-comment'][0],
            ...comments['thread-comment'][0].children,
        ].every(({ text }) => text.paragraphs?.some(({ startIndex }) => (
            text.dataStream.slice(0, startIndex).replaceAll('\r', '').trim()
        )) === true)).toBe(true);
    });
});
