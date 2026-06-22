interface ICellData {
    v: string | number | boolean;
    t: number;
    s: string;
}

interface IDimensionData {
    w?: number;
    h?: number;
    hd: number;
}

const ROW_COUNT = 1200;
const COLUMN_COUNT = 80;
const SHEET_ID = 'dense-text-scroll';
const WORKBOOK_ID = 'workbook-dense-text-scroll';
const CHART_ID = 'dense-text-chart-1';

const border = (rgb: string, s = 1) => ({
    t: { s, cl: { rgb } },
    r: { s, cl: { rgb } },
    b: { s, cl: { rgb } },
    l: { s, cl: { rgb } },
});

const styles = {
    textLeftBlue: {
        ff: 'Arial',
        fs: 11,
        ht: 1,
        vt: 1,
        tb: 1,
        cl: { rgb: 'rgb(37,99,235)' },
        bg: { rgb: 'rgb(239,246,255)' },
        bd: border('rgb(147,197,253)'),
        pd: { t: 1, b: 1, l: 4, r: 4 },
    },
    textCenterGreen: {
        ff: 'Aptos',
        fs: 11,
        ht: 2,
        vt: 2,
        tb: 2,
        cl: { rgb: 'rgb(22,101,52)' },
        bg: { rgb: 'rgb(240,253,244)' },
        bd: border('rgb(134,239,172)'),
        pd: { t: 1, b: 1, l: 4, r: 4 },
    },
    textRightRose: {
        ff: 'Verdana',
        fs: 10,
        ht: 3,
        vt: 3,
        tb: 3,
        cl: { rgb: 'rgb(190,18,60)' },
        bg: { rgb: 'rgb(255,241,242)' },
        bd: border('rgb(253,164,175)'),
        pd: { t: 1, b: 1, l: 4, r: 4 },
    },
    overflowPurple: {
        ff: 'Arial',
        fs: 11,
        ht: 1,
        vt: 2,
        tb: 1,
        cl: { rgb: 'rgb(88,28,135)' },
        bg: { rgb: 'rgb(250,245,255)' },
        bd: border('rgb(216,180,254)', 2),
        pd: { t: 1, b: 1, l: 4, r: 4 },
    },
    clippedSlate: {
        ff: 'Aptos Narrow',
        fs: 10,
        ht: 2,
        vt: 1,
        tb: 2,
        cl: { rgb: 'rgb(51,65,85)' },
        bg: { rgb: 'rgb(248,250,252)' },
        bd: border('rgb(203,213,225)'),
        pd: { t: 1, b: 1, l: 4, r: 4 },
    },
    wrappedAmber: {
        ff: 'Arial',
        fs: 10,
        ht: 1,
        vt: 2,
        tb: 3,
        cl: { rgb: 'rgb(146,64,14)' },
        bg: { rgb: 'rgb(255,251,235)' },
        bd: border('rgb(251,191,36)'),
        pd: { t: 1, b: 1, l: 4, r: 4 },
    },
};

const styleIds = Object.keys(styles);

function createCellText(row: number, column: number): string {
    if (column % 10 === 0) {
        return `R${row} C${column} overflow text carries across neighboring cells when there is enough room`;
    }

    if (column % 7 === 0) {
        return `wrapped multiline candidate ${row}-${column} with enough words to exercise text layout`;
    }

    if (column % 5 === 0) {
        return `colored styled value ${row}:${column}`;
    }

    return `dense ${row}-${column}`;
}

function createChartCell(row: number, column: number): ICellData | null {
    if (column > 5) {
        return null;
    }

    if (row === 0) {
        return {
            v: ['Series', 'North', 'South', 'East', 'West', 'Total'][column],
            t: 1,
            s: 'textCenterGreen',
        };
    }

    if (column === 0) {
        return {
            v: `Item ${row}`,
            t: 1,
            s: 'clippedSlate',
        };
    }

    return {
        v: ((row * 17 + column * 29) % 100) + column * 8,
        t: 2,
        s: styleIds[(row * 7 + column * 3) % styleIds.length],
    };
}

function createCellData(): Record<number, Record<number, ICellData>> {
    const cellData: Record<number, Record<number, ICellData>> = {};

    for (let row = 0; row < ROW_COUNT; row++) {
        const rowCells: Record<number, ICellData> = {};

        for (let column = 0; column < COLUMN_COUNT; column++) {
            rowCells[column] = createChartCell(row, column) ?? {
                v: createCellText(row, column),
                t: 1,
                s: styleIds[(row * 7 + column * 3) % styleIds.length],
            };
        }

        cellData[row] = rowCells;
    }

    return cellData;
}

function createColumnData(): Record<number, IDimensionData> {
    const columnData: Record<number, IDimensionData> = {};

    for (let column = 0; column < COLUMN_COUNT; column++) {
        columnData[column] = {
            w: column % 10 === 0 ? 54 : column % 7 === 0 ? 118 : 82,
            hd: 0,
        };
    }

    return columnData;
}

function createRowData(): Record<number, IDimensionData> {
    const rowData: Record<number, IDimensionData> = {};

    for (let row = 0; row < ROW_COUNT; row++) {
        rowData[row] = {
            h: row % 7 === 0 ? 28 : 22,
            hd: 0,
        };
    }

    return rowData;
}

function createConditionalFormattingResource() {
    return {
        [SHEET_ID]: [
            {
                ranges: [{ startRow: 1, startColumn: 1, endRow: 420, endColumn: 1, rangeType: 0 }],
                cfId: 'dense-cf-highlight',
                stopIfTrue: false,
                rule: {
                    type: 'highlightCell',
                    subType: 'number',
                    operator: 'greaterThan',
                    value: 80,
                    style: {
                        bg: { rgb: 'rgb(220,252,231)' },
                        cl: { rgb: 'rgb(21,128,61)' },
                    },
                },
            },
            {
                ranges: [{ startRow: 1, startColumn: 2, endRow: 420, endColumn: 2, rangeType: 0 }],
                cfId: 'dense-cf-data-bar',
                stopIfTrue: false,
                rule: {
                    type: 'dataBar',
                    isShowValue: true,
                    config: {
                        min: { type: 'num', value: 0 },
                        max: { type: 'num', value: 140 },
                        isGradient: true,
                        positiveColor: '#60a5fa',
                        nativeColor: '#f97316',
                    },
                },
            },
            {
                ranges: [{ startRow: 1, startColumn: 3, endRow: 420, endColumn: 3, rangeType: 0 }],
                cfId: 'dense-cf-color-scale',
                stopIfTrue: false,
                rule: {
                    type: 'colorScale',
                    config: [
                        { index: 0, color: '#fee2e2', value: { type: 'min' } },
                        { index: 1, color: '#fef3c7', value: { type: 'percent', value: 50 } },
                        { index: 2, color: '#bbf7d0', value: { type: 'max' } },
                    ],
                },
            },
        ],
    };
}

function createDataValidationResource() {
    return {
        [SHEET_ID]: [
            {
                uid: 'dense-dv-list',
                type: 'list',
                formula1: 'Open,In Progress,Blocked,Done',
                formula2: '',
                allowBlank: true,
                showErrorMessage: true,
                error: 'Choose a status from the list.',
                ranges: [{ startRow: 1, startColumn: 6, endRow: 250, endColumn: 6, rangeType: 0 }],
            },
            {
                uid: 'dense-dv-decimal',
                type: 'decimal',
                operator: 'between',
                formula1: '0',
                formula2: '150',
                allowBlank: false,
                showErrorMessage: true,
                error: 'Value must be between 0 and 150.',
                ranges: [{ startRow: 1, startColumn: 1, endRow: 420, endColumn: 5, rangeType: 0 }],
            },
            {
                uid: 'dense-dv-checkbox',
                type: 'checkbox',
                ranges: [{ startRow: 1, startColumn: 7, endRow: 250, endColumn: 7, rangeType: 0 }],
            },
        ],
    };
}

function createRangeProtectionResource() {
    return {
        [SHEET_ID]: [
            {
                ranges: [
                    {
                        startRow: 30,
                        startColumn: 10,
                        endRow: 160,
                        endColumn: 18,
                        rangeType: 0,
                        unitId: WORKBOOK_ID,
                        sheetId: SHEET_ID,
                    },
                    {
                        startRow: 260,
                        startColumn: 28,
                        endRow: 420,
                        endColumn: 36,
                        rangeType: 0,
                        unitId: WORKBOOK_ID,
                        sheetId: SHEET_ID,
                    },
                ],
                permissionId: 'dense-range-permission',
                id: 'dense-range-protection',
                name: 'Dense text protected ranges',
                unitType: 3,
                unitId: WORKBOOK_ID,
                subUnitId: SHEET_ID,
                viewState: 'othersCanView',
                editState: 'onlyMe',
            },
        ],
    };
}

function createDrawingResource() {
    return {
        [SHEET_ID]: {
            data: {
                [CHART_ID]: {
                    unitId: WORKBOOK_ID,
                    subUnitId: SHEET_ID,
                    drawingId: CHART_ID,
                    drawingType: 2,
                    componentKey: 'SheetsChartComponent',
                    sheetTransform: {
                        from: { column: 9, columnOffset: 20, row: 2, rowOffset: 6 },
                        to: { column: 18, columnOffset: 50, row: 20, rowOffset: 8 },
                    },
                    axisAlignSheetTransform: {
                        from: { column: 9, columnOffset: 20, row: 2, rowOffset: 6 },
                        to: { column: 18, columnOffset: 50, row: 20, rowOffset: 8 },
                    },
                    transform: {
                        left: 800,
                        top: 50,
                        width: 520,
                        height: 340,
                    },
                    data: {
                        border: '#94a3b8',
                        background: '#ffffff',
                    },
                    allowTransform: true,
                },
            },
            order: [CHART_ID],
        },
    };
}

function createChartResource() {
    return {
        [SHEET_ID]: [
            {
                id: CHART_ID,
                chartType: 4,
                rangeInfo: {
                    rangeInfo: {
                        unitId: WORKBOOK_ID,
                        subUnitId: SHEET_ID,
                        range: { startRow: 0, startColumn: 0, endRow: 36, endColumn: 5, rangeType: 0 },
                    },
                    isRowDirection: true,
                },
                context: {},
                style: {
                    titles: {
                        title: {
                            content: 'Dense Scroll Metrics',
                        },
                    },
                },
                dataAggregation: {},
            },
        ],
    };
}

export const sheetData = {
    id: WORKBOOK_ID,
    sheetOrder: [SHEET_ID],
    name: 'Dense text scroll perf',
    appVersion: '3.0.0-alpha',
    locale: 'zhCN',
    styles,
    sheets: {
        [SHEET_ID]: {
            name: 'Dense text',
            id: SHEET_ID,
            tabColor: '',
            hidden: 0,
            rowCount: ROW_COUNT,
            columnCount: COLUMN_COUNT,
            zoomRatio: 1,
            cellData: createCellData(),
            freeze: {
                xSplit: 0,
                ySplit: 0,
                startRow: -1,
                startColumn: -1,
            },
            scrollTop: 0,
            scrollLeft: 0,
            defaultColumnWidth: 82,
            defaultRowHeight: 22,
            mergeData: [],
            rowData: createRowData(),
            columnData: createColumnData(),
            rowHeader: {
                width: 46,
                hidden: 0,
            },
            columnHeader: {
                height: 20,
                hidden: 0,
            },
            showGridlines: 1,
            rightToLeft: 0,
        },
    },
    resources: [
        {
            name: 'SHEET_CONDITIONAL_FORMATTING_PLUGIN',
            data: JSON.stringify(createConditionalFormattingResource()),
        },
        {
            name: 'SHEET_DATA_VALIDATION_PLUGIN',
            data: JSON.stringify(createDataValidationResource()),
        },
        {
            name: 'SHEET_RANGE_PROTECTION_PLUGIN',
            data: JSON.stringify(createRangeProtectionResource()),
        },
        {
            name: 'SHEET_DRAWING_PLUGIN',
            data: JSON.stringify(createDrawingResource()),
        },
        {
            name: 'SHEET_CHART_PLUGIN',
            data: JSON.stringify(createChartResource()),
        },
    ],
};
