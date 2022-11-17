import { univerSheetCustom, DEFAULT_WORKBOOK_DATA } from '.';

const sheetConfig = {
    container: 'universheet-demo',
    layout: {
        innerRight: false,
        outerLeft: false,
        toolBarConfig: {
            paintFormat: false,
            currencyFormat: false,
            percentageFormat: false,
            numberDecrease: false,
            numberIncrease: false,
            moreFormats: false,
        },
    },
    selections: {
        'sheet-01': [
            {
                selection: {
                    startRow: 0,
                    endRow: 0,
                    startColumn: 3,
                    endColumn: 3,
                },
                cell: {
                    row: 0,
                    column: 3,
                },
            },
        ],
    },
};

univerSheetCustom({
    coreConfig: DEFAULT_WORKBOOK_DATA,
    baseSheetsConfig: sheetConfig,
});