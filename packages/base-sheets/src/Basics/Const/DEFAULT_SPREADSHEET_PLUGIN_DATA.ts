import { ISpreadsheetPluginConfig } from '../Interfaces/SpreadsheetConfig';

export const DEFAULT_SPREADSHEET_PLUGIN_DATA: ISpreadsheetPluginConfig = {
    container: 'universheet',
    layout: 'auto',
    selections: {
        'sheet-01': [
            {
                selection: {
                    startRow: 13,
                    endRow: 14,
                    startColumn: 1,
                    endColumn: 2,
                },
            },
            {
                selection: {
                    startRow: 16,
                    endRow: 18,
                    startColumn: 1,
                    endColumn: 2,
                },
                cell: {
                    row: 16,
                    column: 1,
                },
            },
        ],
        'sheet-02': [
            {
                selection: {
                    startRow: 17,
                    endRow: 20,
                    startColumn: 1,
                    endColumn: 2,
                },
            },
            {
                selection: {
                    startRow: 22,
                    endRow: 23,
                    startColumn: 1,
                    endColumn: 2,
                },
            },
            {
                selection: {
                    startRow: 25,
                    endRow: 27,
                    startColumn: 4,
                    endColumn: 6,
                },
                cell: {
                    row: 25,
                    column: 4,
                },
            },
        ],
    },
};
