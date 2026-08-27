import type { ICellData, IDocumentBody, IWorkbookData, IWorksheetData, LocaleType } from '@univerjs/core';
import {
    BaselineOffset,
    BooleanNumber,
    BorderStyleTypes,
    CellValueType,
    CustomRangeType,
    DataValidationErrorStyle,
    DataValidationOperator,
    DataValidationRenderMode,
    DataValidationType,
    DrawingTypeEnum,
    getSheetsEmptySnapshot,
    HorizontalAlign,
    ImageSourceType,
    TextDecoration,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';

import { createGeneratedSvg } from '../generated-svg';

type CellMatrix = NonNullable<IWorksheetData['cellData']>;
type WorkbookResources = NonNullable<IWorkbookData['resources']>;

const WORKBOOK_ID = 'workbook-01';
const CORE_SHEET_ID = 'core';
const CONDITIONAL_FORMATTING_SHEET_ID = 'conditional-formatting';
const DATA_VALIDATION_SHEET_ID = 'data-validation';
const DRAWING_SHEET_ID = 'drawing';
const FILTER_SHEET_ID = 'filter';
const FIND_REPLACE_SHEET_ID = 'find-replace';
const HYPER_LINK_SHEET_ID = 'hyper-link';
const NOTE_SHEET_ID = 'note';
const SORT_SHEET_ID = 'sort';
const TABLE_SHEET_ID = 'table';
const THREAD_COMMENT_SHEET_ID = 'thread-comment';

const SHEET_ORDER = [
    CORE_SHEET_ID,
    CONDITIONAL_FORMATTING_SHEET_ID,
    DATA_VALIDATION_SHEET_ID,
    DRAWING_SHEET_ID,
    FILTER_SHEET_ID,
    FIND_REPLACE_SHEET_ID,
    HYPER_LINK_SHEET_ID,
    NOTE_SHEET_ID,
    SORT_SHEET_ID,
    TABLE_SHEET_ID,
    THREAD_COMMENT_SHEET_ID,
];

const DATA_ROWS = [
    ['Notebook', 'Hardware', 'Avery', 12, 18, 0.05, 'On track', 0.92, 46255, true, 'Launch,Priority', 5],
    ['Marker', 'Office', 'Blake', 32, 4.5, 0, 'At risk', 0.54, 46256, false, 'Backlog', 2],
    ['Keyboard', 'Hardware', 'Casey', 8, 72, 0.1, 'On track', 0.81, 46258, true, 'Launch,QA', 4],
    ['Desk lamp', 'Office', 'Devon', 10, 35, 0.15, 'Blocked', 0.35, 46259, false, 'Blocked', 1],
    ['Headset', 'Hardware', 'Emery', 15, 49, 0.08, 'At risk', 0.68, 46261, true, 'QA', 3],
    ['Dock', 'Hardware', 'Blake', 11, 129, 0.05, 'On track', 0.76, 46268, true, 'Launch,Vendor', 4],
] as const;

function range(startRow: number, endRow: number, startColumn: number, endColumn: number) {
    return { startRow, endRow, startColumn, endColumn };
}

function createSheet(
    id: string,
    name: string,
    tabColor: string,
    cellData: CellMatrix,
    overrides: Partial<IWorksheetData> = {}
): IWorksheetData {
    return {
        id,
        name,
        tabColor,
        hidden: BooleanNumber.FALSE,
        rowCount: 40,
        columnCount: 18,
        zoomRatio: 1,
        scrollTop: 0,
        scrollLeft: 0,
        defaultColumnWidth: 96,
        defaultRowHeight: 24,
        freeze: { xSplit: 0, ySplit: 3, startColumn: 0, startRow: 3 },
        mergeData: [],
        cellData,
        rowData: {},
        columnData: {},
        rowHeader: { width: 46, hidden: BooleanNumber.FALSE },
        columnHeader: { height: 24, hidden: BooleanNumber.FALSE },
        showGridlines: BooleanNumber.TRUE,
        rightToLeft: BooleanNumber.FALSE,
        ...overrides,
    };
}

function createHeaderRow(values: string[]): Record<number, ICellData> {
    return Object.fromEntries(values.map((value, column) => [column, { v: value, s: 'header' }]));
}

function createLinkCell(label: string, url: string, id: string): ICellData {
    return {
        t: CellValueType.STRING,
        p: {
            id: `${id}-document`,
            body: {
                dataStream: `${label}\r\n`,
                textRuns: [{
                    st: 0,
                    ed: label.length,
                    ts: {
                        cl: { rgb: '#2563EB' },
                        ul: { s: BooleanNumber.TRUE, t: TextDecoration.SINGLE },
                    },
                }],
                customRanges: [{
                    startIndex: 0,
                    endIndex: label.length - 1,
                    rangeId: id,
                    rangeType: CustomRangeType.HYPERLINK,
                    properties: { url },
                }],
            },
            documentStyle: {},
        },
    };
}

function createRichTextCell(): ICellData {
    const text = 'Bold  Italic  Color  H2O';
    return {
        t: CellValueType.STRING,
        p: {
            id: 'core-rich-text',
            body: {
                dataStream: `${text}\r\n`,
                textRuns: [
                    { st: 0, ed: 4, ts: { bl: BooleanNumber.TRUE } },
                    { st: 6, ed: 12, ts: { it: BooleanNumber.TRUE } },
                    { st: 14, ed: 19, ts: { cl: { rgb: '#7C3AED' } } },
                    { st: 22, ed: 23, ts: { va: BaselineOffset.SUBSCRIPT, fs: 8 } },
                ],
            },
            documentStyle: {},
        },
    };
}

function createTitleMerges(endColumn = 7) {
    return [range(0, 0, 0, endColumn), range(1, 1, 0, endColumn)];
}

const CORE_CELL_DATA: CellMatrix = {
    0: { 0: { v: 'Core preset', s: 'title' } },
    1: {
        0: {
            v: 'Edit Table data to recalculate formulas, then exercise rich formatting, layout and spilled arrays here.',
            s: 'subtitle',
        },
    },
    3: createHeaderRow(['Category', 'Formula', 'Live result', 'Development target', '', 'Spill output']),
    4: {
        0: { v: 'Aggregate', s: 'strong' },
        1: { v: 'SUM(named range)' },
        2: { f: '=SUM(TableRevenue)', s: 'money' },
        3: { v: 'Defined name + cross-sheet dependency' },
        5: { f: '=SEQUENCE(3,2,1,1)', s: 'arrayResult' },
    },
    5: {
        0: { v: 'Criteria', s: 'strong' },
        1: { v: 'SUMIFS' },
        2: { f: '=SUMIFS(\'Table\'!G5:G10,\'Table\'!B5:B10,"Hardware")', s: 'money' },
        3: { v: 'Conditional aggregation' },
    },
    6: {
        0: { v: 'Logical', s: 'strong' },
        1: { v: 'IF + COUNTIF' },
        2: { f: '=IF(COUNTIF(\'Table\'!H5:H10,"Blocked")>0,"Needs attention","Clear")' },
        3: { v: 'Boolean branch over cross-sheet data' },
    },
    7: {
        0: { v: 'Lookup', s: 'strong' },
        1: { v: 'XLOOKUP' },
        2: { f: '=XLOOKUP("Keyboard",\'Table\'!A5:A10,\'Table\'!G5:G10,"Not found")', s: 'money' },
        3: { v: 'Modern lookup with fallback' },
    },
    8: {
        0: { v: 'Text', s: 'strong' },
        1: { v: 'TEXTJOIN' },
        2: { f: '=TEXTJOIN(" · ",TRUE,\'Table\'!A5:A8)' },
        3: { v: 'Array-aware text composition' },
    },
    9: {
        0: { v: 'Date', s: 'strong' },
        1: { v: 'WORKDAY + DATE' },
        2: { f: '=WORKDAY(DATE(2026,8,19),10)', s: 'date' },
        3: { v: 'Date serial calculation and formatting' },
    },
    10: {
        0: { v: 'Error handling', s: 'strong' },
        1: { v: 'IFERROR' },
        2: { f: '=IFERROR(1/0,"Handled")' },
        3: { v: 'Error propagation and fallback' },
        5: { f: '=FILTER(\'Table\'!A5:C10,\'Table\'!H5:H10="On track","No matches")' },
    },
    12: { 0: { v: 'Formatting probes', s: 'section' }, 1: { v: 'Compare rendering, then edit each style.' } },
    14: createHeaderRow([
        'Currency',
        'Accounting',
        'Percent',
        'Date',
        'Time',
        'Scientific',
        'Fraction',
        'Thousands',
    ]),
    15: {
        0: { v: 123456.78, s: 'money' },
        1: { v: -4200, s: 'accounting' },
        2: { v: 0.8735, s: 'percent2' },
        3: { v: 46255, s: 'dateLong' },
        4: { v: 0.6458333333, s: 'time' },
        5: { v: 123456789, s: 'scientific' },
        6: { v: 0.625, s: 'fraction' },
        7: { v: 9876543.21, s: 'thousands' },
    },
    17: createHeaderRow(['Left', 'Center', 'Right', 'Top', 'Bottom', 'Wrapped text', 'Rotated', 'Vertical']),
    18: {
        0: { v: 'Left aligned', s: 'alignLeft' },
        1: { v: 'Centered', s: 'alignCenter' },
        2: { v: 'Right aligned', s: 'alignRight' },
        3: { v: 'Top', s: 'alignTop' },
        4: { v: 'Bottom', s: 'alignBottom' },
        5: { v: 'This long sentence wraps inside a deliberately narrow cell.', s: 'wrapped' },
        6: { v: '45 degrees', s: 'rotated' },
        7: { v: 'Vertical', s: 'verticalText' },
    },
    20: createHeaderRow(['Thin border', 'Dashed border', 'Double bottom', 'Diagonal', 'Fill', 'Rich text']),
    21: {
        0: { v: 'Thin', s: 'borderThin' },
        1: { v: 'Dashed', s: 'borderDashed' },
        2: { v: 'Double', s: 'borderDouble' },
        3: { v: 'Diagonal', s: 'borderDiagonal' },
        4: { v: 'Soft fill', s: 'softFill' },
        5: createRichTextCell(),
    },
    23: {
        0: { v: 'Typography', s: 'strong' },
        1: { v: 'Bold + italic', s: 'boldItalic' },
        2: { v: 'Theme color', s: 'coloredText' },
        3: { v: 'Filled cell', s: 'accentFill' },
        4: { v: 'Underline', s: 'underline' },
        5: { v: 'Strike', s: 'strike' },
        6: { v: '001234', t: CellValueType.FORCE_STRING, s: 'forceString' },
    },
    25: { 0: { v: 'Merged banner with centered content', s: 'mergedBanner' } },
    27: {
        0: { v: 'Layout probes', s: 'section' },
        1: { v: 'Resize rows/columns, unhide row 30 and column K, toggle gridlines, then change zoom.' },
    },
    29: { 0: { v: 'This row starts hidden.' } },
    31: createHeaderRow(['Preset tab', 'Primary action', 'Preset tab', 'Primary action']),
    32: {
        0: { v: 'Conditional Formatting', s: 'strong' },
        1: { v: 'Edit values and rules' },
        2: { v: 'Data Validation', s: 'strong' },
        3: { v: 'Open dropdowns and reject invalid input' },
    },
    33: {
        0: { v: 'Drawing', s: 'strong' },
        1: { v: 'Move and resize SVG cards' },
        2: { v: 'Filter', s: 'strong' },
        3: { v: 'Filter the header range' },
    },
    34: {
        0: { v: 'Find & Replace', s: 'strong' },
        1: { v: 'Replace repeated text' },
        2: { v: 'Hyperlink', s: 'strong' },
        3: { v: 'Open and edit a link' },
    },
    35: {
        0: { v: 'Note', s: 'strong' },
        1: { v: 'Inspect the note marker' },
        2: { v: 'Sort', s: 'strong' },
        3: { v: 'Sort an unsorted range' },
    },
    36: {
        0: { v: 'Table', s: 'strong' },
        1: { v: 'Use table headers and totals' },
        2: { v: 'Thread Comment', s: 'strong' },
        3: { v: 'Reply to a review thread' },
    },
};

function createCoreCellData(): CellMatrix {
    return structuredClone(CORE_CELL_DATA);
}

function createDataFeatureCellData(title: string, instruction: string): CellMatrix {
    const cells: CellMatrix = {
        0: { 0: { v: title, s: 'title' } },
        1: { 0: { v: instruction, s: 'subtitle' } },
        3: createHeaderRow([
            'Product',
            'Category',
            'Owner',
            'Units',
            'Unit price',
            'Discount',
            'Revenue',
            'Status',
            'Progress',
            'Due date',
            'Approved',
            'Tags',
            'Priority',
        ]),
    };

    DATA_ROWS.forEach((values, index) => {
        const row = index + 4;
        const [product, category, owner, units, price, discount, status, progress, date, approved, tags, priority]
            = values;
        cells[row] = {
            0: { v: product },
            1: { v: category },
            2: { v: owner },
            3: { v: units },
            4: { v: price, s: 'money' },
            5: { v: discount, s: 'percent' },
            6: { f: `=D${row + 1}*E${row + 1}*(1-F${row + 1})`, s: 'money' },
            7: { v: status },
            8: { v: progress, s: 'percent' },
            9: { v: date, s: 'date' },
            10: { v: approved, t: CellValueType.BOOLEAN },
            11: { v: tags },
            12: { v: priority },
        };
    });

    cells[11] = {
        0: { v: 'Totals', s: 'section' },
        3: { f: '=SUM(D5:D10)', s: 'strong' },
        6: { f: '=SUM(G5:G10)', s: 'moneyStrong' },
        8: { f: '=AVERAGE(I5:I10)', s: 'percentStrong' },
    };
    return cells;
}

function createDrawingCellData(): CellMatrix {
    return {
        0: { 0: { v: 'Drawing preset', s: 'title' } },
        1: { 0: { v: 'Move, resize, rotate and reorder two deterministic offline SVG drawings.', s: 'subtitle' } },
        3: createHeaderRow(['Fixture', 'Try this', 'Expected surface']),
        4: {
            0: { v: 'Review ready card', s: 'strong' },
            1: { v: 'Move, resize and rotate the blue card.' },
            2: { v: 'Selection handles, anchor updates and undo/redo.' },
        },
        5: {
            0: { v: 'Drawing tools card', s: 'strong' },
            1: { v: 'Reorder or delete the purple card, then undo.' },
            2: { v: 'Layer order and deletion lifecycle.' },
        },
    };
}

function createFindReplaceCellData(): CellMatrix {
    return {
        0: { 0: { v: 'Find & Replace preset', s: 'title' } },
        1: { 0: { v: 'Find “workbench”, replace it with “fixture”, then undo the replacement.', s: 'subtitle' } },
        3: createHeaderRow(['Record', 'Search target', 'Scope']),
        4: { 0: { v: 'A-101' }, 1: { v: 'workbench ready' }, 2: { v: 'Plain text' } },
        5: { 0: { v: 'A-102' }, 1: { v: 'workbench blocked' }, 2: { v: 'Plain text' } },
        6: { 0: { v: 'A-103' }, 1: { v: 'WORKBENCH review' }, 2: { v: 'Case-sensitive option' } },
        7: { 0: { v: 'A-104' }, 1: { v: 'pre-workbench-post' }, 2: { v: 'Whole-cell option' } },
        9: {
            0: { v: 'Regression target', s: 'section' },
            1: { v: 'Verify result navigation, replace one, replace all and undo.' },
        },
    };
}

function createHyperLinkCellData(): CellMatrix {
    return {
        0: { 0: { v: 'Hyperlink preset', s: 'title' } },
        1: { 0: { v: 'Open the rich-text link, then edit, copy and remove it.', s: 'subtitle' } },
        3: createHeaderRow(['Fixture', 'Hyperlink', 'Try this']),
        4: {
            0: { v: 'Documentation link', s: 'strong' },
            1: createLinkCell('Open Univer documentation', 'https://docs.univer.ai', 'hyper-link-docs'),
            2: { v: 'Select B5 and exercise the hyperlink popup actions.' },
        },
        6: {
            0: { v: 'Editable target', s: 'section' },
            1: { v: 'Turn this plain text into a link, then undo.' },
        },
    };
}

function createNoteCellData(): CellMatrix {
    return {
        0: { 0: { v: 'Note preset', s: 'title' } },
        1: { 0: { v: 'Hover or select B5 to inspect its deterministic lightweight cell note.', s: 'subtitle' } },
        3: createHeaderRow(['Fixture', 'Note target', 'Try this']),
        4: {
            0: { v: 'Cell note', s: 'strong' },
            1: { v: 'Hover or select this noted cell' },
            2: { v: 'Inspect the marker, edit the note, delete it and undo.' },
        },
    };
}

function createSortCellData(): CellMatrix {
    return {
        0: { 0: { v: 'Sort preset', s: 'title' } },
        1: { 0: { v: 'Select A4:C9, sort Priority ascending, then add Owner as a second key.', s: 'subtitle' } },
        3: createHeaderRow(['Item', 'Owner', 'Priority']),
        4: { 0: { v: 'Gamma' }, 1: { v: 'Blake' }, 2: { v: 4 } },
        5: { 0: { v: 'Alpha' }, 1: { v: 'Avery' }, 2: { v: 2 } },
        6: { 0: { v: 'Zeta' }, 1: { v: 'Casey' }, 2: { v: 5 } },
        7: { 0: { v: 'Beta' }, 1: { v: 'Blake' }, 2: { v: 1 } },
        8: { 0: { v: 'Delta' }, 1: { v: 'Avery' }, 2: { v: 3 } },
        10: { 0: { v: 'Undo target', s: 'section' }, 1: { v: 'Undo restores the intentionally unsorted order.' } },
    };
}

function createThreadCommentCellData(): CellMatrix {
    return {
        0: { 0: { v: 'Thread Comment preset', s: 'title' } },
        1: { 0: { v: 'Open the thread on B5 to inspect a root comment and one reply.', s: 'subtitle' } },
        3: createHeaderRow(['Fixture', 'Comment target', 'Try this']),
        4: {
            0: { v: 'Review thread', s: 'strong' },
            1: { v: 'Pricing assumption needs review' },
            2: { v: 'Open comments, reply, resolve, reopen and delete.' },
        },
    };
}

function createCoreSheet(rightToLeft: BooleanNumber): IWorksheetData {
    return createSheet(CORE_SHEET_ID, 'Core', '#2563EB', createCoreCellData(), {
        rightToLeft,
        rowCount: 70,
        showGridlines: BooleanNumber.FALSE,
        rowData: {
            0: { h: 42 },
            1: { h: 34 },
            3: { h: 30 },
            18: { h: 64 },
            25: { h: 42 },
            29: { h: 24, hd: BooleanNumber.TRUE },
            31: { h: 30 },
        },
        columnData: {
            0: { w: 135 },
            1: { w: 175 },
            2: { w: 235 },
            3: { w: 260 },
            4: { w: 100 },
            5: { w: 125 },
            6: { w: 125 },
            7: { w: 125 },
            10: { w: 96, hd: BooleanNumber.TRUE },
        },
        mergeData: [...createTitleMerges(), range(25, 25, 0, 7)],
    });
}

function createDataFeatureSheet(
    id: string,
    name: string,
    tabColor: string,
    instruction: string,
    rightToLeft: BooleanNumber
): IWorksheetData {
    return createSheet(id, name, tabColor, createDataFeatureCellData(`${name} preset`, instruction), {
        rightToLeft,
        rowCount: 50,
        columnCount: 20,
        freeze: { xSplit: 1, ySplit: 4, startColumn: 1, startRow: 4 },
        rowData: { 0: { h: 42 }, 1: { h: 36 }, 3: { h: 32 }, 11: { h: 30 } },
        columnData: {
            0: { w: 130 },
            1: { w: 110 },
            2: { w: 100 },
            3: { w: 80 },
            4: { w: 100 },
            5: { w: 95 },
            6: { w: 115 },
            7: { w: 105 },
            8: { w: 105 },
            9: { w: 110 },
            10: { w: 95 },
            11: { w: 145 },
            12: { w: 90 },
        },
        mergeData: createTitleMerges(12),
    });
}

function createSimpleFeatureSheet(
    id: string,
    name: string,
    tabColor: string,
    cellData: CellMatrix,
    rightToLeft: BooleanNumber
): IWorksheetData {
    return createSheet(id, name, tabColor, cellData, {
        rightToLeft,
        rowData: { 0: { h: 42 }, 1: { h: 34 }, 3: { h: 30 } },
        columnData: { 0: { w: 180 }, 1: { w: 250 }, 2: { w: 290 }, 3: { w: 180 } },
        mergeData: createTitleMerges(),
    });
}

function createSheets(direction: 'ltr' | 'rtl'): IWorkbookData['sheets'] {
    const rightToLeft = direction === 'rtl' ? BooleanNumber.TRUE : BooleanNumber.FALSE;
    return {
        [CORE_SHEET_ID]: createCoreSheet(rightToLeft),
        [CONDITIONAL_FORMATTING_SHEET_ID]: createDataFeatureSheet(
            CONDITIONAL_FORMATTING_SHEET_ID,
            'Conditional Formatting',
            '#DC2626',
            'Edit Revenue, Status, Progress, Owner or Priority and inspect the six live formatting rules.',
            rightToLeft
        ),
        [DATA_VALIDATION_SHEET_ID]: createDataFeatureSheet(
            DATA_VALIDATION_SHEET_ID,
            'Data Validation',
            '#D97706',
            'Open dropdowns and checkboxes, then enter invalid values to exercise all nine validation types.',
            rightToLeft
        ),
        [DRAWING_SHEET_ID]: createSimpleFeatureSheet(
            DRAWING_SHEET_ID,
            'Drawing',
            '#7C3AED',
            createDrawingCellData(),
            rightToLeft
        ),
        [FILTER_SHEET_ID]: createDataFeatureSheet(
            FILTER_SHEET_ID,
            'Filter',
            '#0891B2',
            'Open a header filter, include only Hardware, combine a second condition and clear the filter.',
            rightToLeft
        ),
        [FIND_REPLACE_SHEET_ID]: createSimpleFeatureSheet(
            FIND_REPLACE_SHEET_ID,
            'Find & Replace',
            '#4F46E5',
            createFindReplaceCellData(),
            rightToLeft
        ),
        [HYPER_LINK_SHEET_ID]: createSimpleFeatureSheet(
            HYPER_LINK_SHEET_ID,
            'Hyperlink',
            '#2563EB',
            createHyperLinkCellData(),
            rightToLeft
        ),
        [NOTE_SHEET_ID]: createSimpleFeatureSheet(
            NOTE_SHEET_ID,
            'Note',
            '#EA580C',
            createNoteCellData(),
            rightToLeft
        ),
        [SORT_SHEET_ID]: createSimpleFeatureSheet(
            SORT_SHEET_ID,
            'Sort',
            '#16A34A',
            createSortCellData(),
            rightToLeft
        ),
        [TABLE_SHEET_ID]: createDataFeatureSheet(
            TABLE_SHEET_ID,
            'Table',
            '#0F766E',
            'Use table header actions, resize the table, toggle its style and inspect the totals row below it.',
            rightToLeft
        ),
        [THREAD_COMMENT_SHEET_ID]: createSimpleFeatureSheet(
            THREAD_COMMENT_SHEET_ID,
            'Thread Comment',
            '#DB2777',
            createThreadCommentCellData(),
            rightToLeft
        ),
    };
}

const REQUIRED_VALIDATION_OPTIONS = {
    allowBlank: false,
    showErrorMessage: true,
    errorStyle: DataValidationErrorStyle.STOP,
};

function createValidationRules() {
    return [
        {
            ...REQUIRED_VALIDATION_OPTIONS,
            uid: 'category-list',
            type: DataValidationType.LIST,
            ranges: [range(4, 9, 1, 1)],
            formula1: JSON.stringify(['Hardware', 'Office']),
            renderMode: DataValidationRenderMode.ARROW,
        },
        {
            ...REQUIRED_VALIDATION_OPTIONS,
            uid: 'owner-length',
            type: DataValidationType.TEXT_LENGTH,
            ranges: [range(4, 9, 2, 2)],
            operator: DataValidationOperator.BETWEEN,
            formula1: '2',
            formula2: '20',
        },
        {
            ...REQUIRED_VALIDATION_OPTIONS,
            uid: 'units-whole',
            type: DataValidationType.WHOLE,
            ranges: [range(4, 9, 3, 3)],
            operator: DataValidationOperator.BETWEEN,
            formula1: '1',
            formula2: '100',
        },
        {
            ...REQUIRED_VALIDATION_OPTIONS,
            uid: 'discount-decimal',
            type: DataValidationType.DECIMAL,
            ranges: [range(4, 9, 5, 5)],
            operator: DataValidationOperator.BETWEEN,
            formula1: '0',
            formula2: '0.5',
        },
        {
            ...REQUIRED_VALIDATION_OPTIONS,
            uid: 'status-list',
            type: DataValidationType.LIST,
            ranges: [range(4, 9, 7, 7)],
            formula1: JSON.stringify(['On track', 'At risk', 'Blocked']),
            renderMode: DataValidationRenderMode.ARROW,
        },
        {
            ...REQUIRED_VALIDATION_OPTIONS,
            uid: 'progress-custom',
            type: DataValidationType.CUSTOM,
            ranges: [range(4, 9, 8, 8)],
            formula1: '=AND(I5>=0,I5<=1)',
        },
        {
            ...REQUIRED_VALIDATION_OPTIONS,
            uid: 'due-date',
            type: DataValidationType.DATE,
            ranges: [range(4, 9, 9, 9)],
            operator: DataValidationOperator.BETWEEN,
            formula1: '2026-08-01',
            formula2: '2026-12-31',
        },
        {
            uid: 'approved-checkbox',
            type: DataValidationType.CHECKBOX,
            ranges: [range(4, 9, 10, 10)],
            formula1: 'TRUE',
            formula2: 'FALSE',
        },
        {
            ...REQUIRED_VALIDATION_OPTIONS,
            uid: 'tag-list-multiple',
            type: DataValidationType.LIST_MULTIPLE,
            ranges: [range(4, 9, 11, 11)],
            formula1: JSON.stringify(['Launch', 'Priority', 'QA', 'Backlog', 'Blocked', 'Vendor']),
            renderMode: DataValidationRenderMode.TEXT,
        },
    ];
}

function createValidationResource(): WorkbookResources[number] {
    return {
        name: 'SHEET_DATA_VALIDATION_PLUGIN',
        data: JSON.stringify({ [DATA_VALIDATION_SHEET_ID]: createValidationRules() }),
    };
}

const CONDITIONAL_FORMATTING_RULES = [
    {
        cfId: 'revenue-bars',
        ranges: [range(4, 9, 6, 6)],
        stopIfTrue: false,
        rule: {
            type: 'dataBar',
            isShowValue: true,
            config: {
                min: { type: 'min' },
                max: { type: 'max' },
                isGradient: true,
                positiveColor: '#60A5FA',
                nativeColor: '#F87171',
            },
        },
    },
    {
        cfId: 'status-highlight',
        ranges: [range(4, 9, 7, 7)],
        stopIfTrue: false,
        rule: {
            type: 'highlightCell',
            subType: 'text',
            operator: 'containsText',
            value: 'Blocked',
            style: { bg: { rgb: '#FEE2E2' }, cl: { rgb: '#991B1B' }, bl: BooleanNumber.TRUE },
        },
    },
    {
        cfId: 'progress-scale',
        ranges: [range(4, 9, 8, 8)],
        stopIfTrue: false,
        rule: {
            type: 'colorScale',
            config: [
                { index: 0, color: '#FECACA', value: { type: 'min' } },
                { index: 1, color: '#FEF3C7', value: { type: 'percent', value: 50 } },
                { index: 2, color: '#BBF7D0', value: { type: 'max' } },
            ],
        },
    },
    {
        cfId: 'priority-icons',
        ranges: [range(4, 9, 12, 12)],
        stopIfTrue: false,
        rule: {
            type: 'iconSet',
            isShowValue: true,
            config: [
                {
                    iconType: '3Arrows',
                    iconId: '0',
                    operator: 'greaterThanOrEqual',
                    value: { type: 'num', value: 4 },
                },
                {
                    iconType: '3Arrows',
                    iconId: '1',
                    operator: 'greaterThanOrEqual',
                    value: { type: 'num', value: 2 },
                },
                {
                    iconType: '3Arrows',
                    iconId: '2',
                    operator: 'lessThan',
                    value: { type: 'num', value: 2 },
                },
            ],
        },
    },
    {
        cfId: 'duplicate-owner',
        ranges: [range(4, 9, 2, 2)],
        stopIfTrue: false,
        rule: {
            type: 'highlightCell',
            subType: 'duplicateValues',
            style: { bg: { rgb: '#EDE9FE' }, cl: { rgb: '#5B21B6' } },
        },
    },
    {
        cfId: 'top-revenue',
        ranges: [range(4, 9, 6, 6)],
        stopIfTrue: false,
        rule: {
            type: 'highlightCell',
            subType: 'rank',
            isBottom: false,
            isPercent: false,
            value: 2,
            style: { bl: BooleanNumber.TRUE, cl: { rgb: '#14532D' } },
        },
    },
];

function createConditionalFormattingRules() {
    return structuredClone(CONDITIONAL_FORMATTING_RULES);
}

function createConditionalFormattingResource(): WorkbookResources[number] {
    return {
        name: 'SHEET_CONDITIONAL_FORMATTING_PLUGIN',
        data: JSON.stringify({ [CONDITIONAL_FORMATTING_SHEET_ID]: createConditionalFormattingRules() }),
    };
}

function createFilterResource(): WorkbookResources[number] {
    return {
        name: 'SHEET_FILTER_PLUGIN',
        data: JSON.stringify({
            [FILTER_SHEET_ID]: {
                ref: range(3, 9, 0, 12),
                filterColumns: [],
                cachedFilteredOut: [],
            },
        }),
    };
}

function createNoteResource(): WorkbookResources[number] {
    return {
        name: 'SHEET_NOTE_PLUGIN',
        data: JSON.stringify({
            [NOTE_SHEET_ID]: {
                4: {
                    1: {
                        id: 'note-preset-fixture',
                        row: 4,
                        col: 1,
                        width: 260,
                        height: 90,
                        note: 'Notes are lightweight cell annotations. Edit this note, delete it, then undo.',
                    },
                },
            },
        }),
    };
}

function createCommentBody(id: string, text: string): IDocumentBody {
    const dataStream = `${text}\r\n`;
    return {
        dataStream,
        paragraphs: [{ startIndex: dataStream.length - 2, paragraphId: `${id}-paragraph` }],
        sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: `${id}-section` }],
    };
}

function createThreadCommentResource(): WorkbookResources[number] {
    const threadId = 'pricing-review-thread';
    return {
        name: 'SHEET_UNIVER_THREAD_COMMENT_PLUGIN',
        data: JSON.stringify({
            [THREAD_COMMENT_SHEET_ID]: [{
                id: threadId,
                threadId,
                ref: 'B5',
                dT: '2026-08-19T00:00:00.000Z',
                personId: 'developer',
                text: createCommentBody(threadId, 'Review the pricing assumption before release.'),
                unitId: WORKBOOK_ID,
                subUnitId: THREAD_COMMENT_SHEET_ID,
                children: [{
                    id: 'pricing-review-reply',
                    threadId,
                    parentId: threadId,
                    ref: '',
                    dT: '2026-08-19T00:05:00.000Z',
                    personId: 'reviewer',
                    text: createCommentBody(
                        'pricing-review-reply',
                        'Confirmed: the formula should include the discount column.'
                    ),
                    unitId: WORKBOOK_ID,
                    subUnitId: THREAD_COMMENT_SHEET_ID,
                }],
            }],
        }),
    };
}

function createTableResource(): WorkbookResources[number] {
    return {
        name: 'SHEET_TABLE_PLUGIN',
        data: JSON.stringify({
            [TABLE_SHEET_ID]: {
                tables: [{
                    id: 'preset-table',
                    name: 'PresetTable',
                    range: range(3, 9, 0, 12),
                    options: { showHeader: true, tableStyleId: 'table-default-4' },
                    filters: {},
                    columns: [],
                    meta: {},
                }],
                tableFilteredOutRows: [],
            },
        }),
    };
}

function createDrawingResource(): WorkbookResources[number] {
    const createSource = (accent: string, heading: string, detail: string) => createGeneratedSvg({
        width: 344,
        height: 132,
        content: [
            `<rect width="344" height="132" rx="20" fill="${accent}"/>`,
            '<circle cx="64" cy="66" r="24" fill="#ffffff" fill-opacity=".2"/>',
            '<path d="M52 67l8 8 17-20" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
            `<text x="104" y="59" font-family="Arial" font-size="22" font-weight="700" fill="#fff">${heading}</text>`,
            `<text x="104" y="88" font-family="Arial" font-size="14" fill="#fff">${detail}</text>`,
        ],
    });
    const createDrawing = (
        drawingId: string,
        image: ReturnType<typeof createGeneratedSvg>,
        fromRow: number,
        toRow: number,
        toRowOffset: number,
        fromColumn: number,
        toColumn: number,
        angle: number
    ) => {
        const sheetTransform = {
            from: { row: fromRow, column: fromColumn, rowOffset: 0, columnOffset: 8 },
            to: { row: toRow, column: toColumn, rowOffset: toRowOffset, columnOffset: 64 },
        };
        return {
            unitId: WORKBOOK_ID,
            subUnitId: DRAWING_SHEET_ID,
            drawingId,
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: ImageSourceType.BASE64,
            source: image.source,
            transform: { left: 908, top: fromRow === 3 ? 100 : 274, width: image.width, height: image.height, angle },
            sheetTransform,
            axisAlignSheetTransform: sheetTransform,
        };
    };
    const first = createDrawing(
        'review-card',
        createSource('#2563EB', 'Review ready', 'Offline SVG · resize me'),
        3,
        8,
        6,
        4,
        7,
        0
    );
    const second = createDrawing(
        'rotate-card',
        createSource('#7C3AED', 'Drawing tools', 'Rotate · arrange · delete'),
        10,
        15,
        12,
        5,
        8,
        -4
    );

    return {
        name: 'SHEET_DRAWING_PLUGIN',
        data: JSON.stringify({
            [DRAWING_SHEET_ID]: {
                data: { [first.drawingId]: first, [second.drawingId]: second },
                order: [first.drawingId, second.drawingId],
            },
        }),
    };
}

function createDefinedNameResource(): WorkbookResources[number] {
    return {
        name: 'SHEET_DEFINED_NAME_PLUGIN',
        data: JSON.stringify({
            tableRevenue: {
                id: 'table-revenue',
                name: 'TableRevenue',
                formulaOrRefString: "'Table'!$G$5:$G$10",
                localSheetId: 'AllDefaultWorkbook',
                comment: 'Revenue formulas in the Table preset sample.',
            },
        }),
    };
}

function createRangeThemeResource(): WorkbookResources[number] {
    return {
        name: 'SHEET_RANGE_THEME_MODEL_PLUGIN',
        data: JSON.stringify({
            rangeThemeStyleRuleMap: {
                'core-zebra-rule': {
                    themeName: 'workbench-zebra',
                    rangeInfo: {
                        unitId: WORKBOOK_ID,
                        subUnitId: CORE_SHEET_ID,
                        range: range(3, 10, 0, 3),
                    },
                },
            },
            rangeThemeStyleMapJson: {
                'workbench-zebra': {
                    name: 'workbench-zebra',
                    wholeStyle: { vt: VerticalAlign.MIDDLE },
                    headerRowStyle: {
                        bg: { rgb: '#DCFCE7' },
                        cl: { rgb: '#14532D' },
                        bl: BooleanNumber.TRUE,
                    },
                    firstRowStyle: { bg: { rgb: '#F0FDF4' } },
                    secondRowStyle: { bg: { rgb: '#FFFFFF' } },
                    lastRowStyle: {
                        bd: { b: { s: BorderStyleTypes.THIN, cl: { rgb: '#86EFAC' } } },
                    },
                },
            },
        }),
    };
}

function createStyles(): IWorkbookData['styles'] {
    const thinBorder = { s: BorderStyleTypes.THIN, cl: { rgb: '#94A3B8' } };
    return {
        title: {
            bl: BooleanNumber.TRUE,
            fs: 18,
            bg: { rgb: '#1E3A8A' },
            cl: { rgb: '#FFFFFF' },
            ht: HorizontalAlign.CENTER,
            vt: VerticalAlign.MIDDLE,
        },
        subtitle: {
            cl: { rgb: '#475569' },
            fs: 10,
            tb: WrapStrategy.WRAP,
            vt: VerticalAlign.MIDDLE,
            pd: { l: 8 },
        },
        header: {
            bl: BooleanNumber.TRUE,
            bg: { rgb: '#DBEAFE' },
            cl: { rgb: '#1E3A8A' },
            ht: HorizontalAlign.CENTER,
            vt: VerticalAlign.MIDDLE,
            tb: WrapStrategy.WRAP,
            bd: { t: thinBorder, r: thinBorder, b: thinBorder, l: thinBorder },
        },
        section: { bl: BooleanNumber.TRUE, bg: { rgb: '#E2E8F0' }, vt: VerticalAlign.MIDDLE },
        strong: { bl: BooleanNumber.TRUE },
        moneyStrong: { bl: BooleanNumber.TRUE, n: { pattern: '$#,##0.00' } },
        percentStrong: { bl: BooleanNumber.TRUE, n: { pattern: '0%' } },
        money: { n: { pattern: '$#,##0.00;[Red]-$#,##0.00' } },
        percent: { n: { pattern: '0%' } },
        percent2: { n: { pattern: '0.00%' } },
        date: { n: { pattern: 'yyyy-mm-dd' } },
        dateLong: { n: { pattern: 'dddd, mmmm d, yyyy' } },
        time: { n: { pattern: 'h:mm AM/PM' } },
        accounting: { n: { pattern: '$#,##0.00;[Red]($#,##0.00);-' } },
        scientific: { n: { pattern: '0.00E+00' } },
        fraction: { n: { pattern: '# ?/?' } },
        thousands: { n: { pattern: '#,##0.00' } },
        arrayResult: { bg: { rgb: '#F0FDF4' }, ht: HorizontalAlign.CENTER },
        boldItalic: { bl: BooleanNumber.TRUE, it: BooleanNumber.TRUE, fs: 13 },
        coloredText: { cl: { rgb: '#DC2626' }, bl: BooleanNumber.TRUE },
        accentFill: { bg: { rgb: '#FEF3C7' }, cl: { rgb: '#92400E' } },
        underline: { ul: { s: BooleanNumber.TRUE, t: TextDecoration.DOUBLE } },
        strike: { st: { s: BooleanNumber.TRUE } },
        forceString: { cl: { rgb: '#166534' }, bg: { rgb: '#DCFCE7' } },
        alignLeft: { ht: HorizontalAlign.LEFT },
        alignCenter: { ht: HorizontalAlign.CENTER },
        alignRight: { ht: HorizontalAlign.RIGHT },
        alignTop: { vt: VerticalAlign.TOP },
        alignBottom: { vt: VerticalAlign.BOTTOM },
        wrapped: { tb: WrapStrategy.WRAP, vt: VerticalAlign.MIDDLE },
        rotated: { tr: { a: 45 }, ht: HorizontalAlign.CENTER, vt: VerticalAlign.MIDDLE },
        verticalText: { tr: { a: 0, v: BooleanNumber.TRUE }, ht: HorizontalAlign.CENTER },
        borderThin: { bd: { t: thinBorder, r: thinBorder, b: thinBorder, l: thinBorder } },
        borderDashed: {
            bd: {
                t: { s: BorderStyleTypes.DASHED, cl: { rgb: '#7C3AED' } },
                r: { s: BorderStyleTypes.DASHED, cl: { rgb: '#7C3AED' } },
                b: { s: BorderStyleTypes.DASHED, cl: { rgb: '#7C3AED' } },
                l: { s: BorderStyleTypes.DASHED, cl: { rgb: '#7C3AED' } },
            },
        },
        borderDouble: { bd: { b: { s: BorderStyleTypes.DOUBLE, cl: { rgb: '#0F172A' } } } },
        borderDiagonal: { bd: { tl_br: { s: BorderStyleTypes.MEDIUM, cl: { rgb: '#EA580C' } } } },
        softFill: { bg: { rgb: '#FCE7F3' }, cl: { rgb: '#9D174D' } },
        mergedBanner: {
            bl: BooleanNumber.TRUE,
            fs: 13,
            bg: { rgb: '#EDE9FE' },
            cl: { rgb: '#5B21B6' },
            ht: HorizontalAlign.CENTER,
            vt: VerticalAlign.MIDDLE,
        },
    };
}

export function createSheetFixture(
    locale: LocaleType,
    direction: 'ltr' | 'rtl',
    zoomRatio: number = 1
): IWorkbookData {
    const snapshot = getSheetsEmptySnapshot(WORKBOOK_ID, locale, 'Univer Sheets Workbench');
    snapshot.sheetOrder = [...SHEET_ORDER];
    snapshot.styles = createStyles();
    snapshot.sheets = createSheets(direction);
    Object.values(snapshot.sheets).forEach((sheet) => {
        sheet.zoomRatio = zoomRatio;
    });
    snapshot.resources = [
        createDefinedNameResource(),
        createRangeThemeResource(),
        createValidationResource(),
        createConditionalFormattingResource(),
        createFilterResource(),
        createNoteResource(),
        createThreadCommentResource(),
        createTableResource(),
        createDrawingResource(),
    ];
    return snapshot;
}
