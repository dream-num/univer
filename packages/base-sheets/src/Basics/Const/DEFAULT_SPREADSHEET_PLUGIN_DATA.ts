import { defaultLayout } from '../../View/UI/SheetContainer';
import { ISheetPluginConfig } from '../Interfaces/SpreadsheetConfig';

export const DEFAULT_SPREADSHEET_PLUGIN_DATA: ISheetPluginConfig = {
    container: 'universheet',
    layout: defaultLayout,
    selections: {
        'sheet-01': [
            {
                selection: {
                    startRow: 0,
                    endRow: 0,
                    startColumn: 0,
                    endColumn: 0,
                },
            },
        ],
        'sheet-02': [
            {
                selection: {
                    startRow: 0,
                    endRow: 0,
                    startColumn: 0,
                    endColumn: 0,
                },
            },
        ],
    },
};
