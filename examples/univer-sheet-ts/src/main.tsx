import { UniverSheet, Univer } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { SheetPlugin } from '@univerjs/base-sheets';
import { SheetUIPlugin } from '@univerjs/ui-plugin-sheets';
import { DEFAULT_WORKBOOK_DATA_DEMO } from '@univerjs/common-plugin-data';
import { ClipboardPlugin } from '@univerjs/sheets-plugin-clipboard';
import { ImportXlsxPlugin } from '@univerjs/sheets-plugin-import-xlsx';
import { UIPlugin } from '@univerjs/base-ui';

const uiDefaultConfigDemo = {
    container: 'universheet',
    selections: {
        'sheet-0001': [
            {
                selection: {
                    startRow: 2,
                    endRow: 2,
                    startColumn: 3,
                    endColumn: 3,
                },
                cell: {
                    row: 2,
                    column: 3,
                },
            },
        ],
    },
};

const sheetUIConfig = {
    container: 'universheet',
};

// univer
const univer = new Univer();

// base-render
univer.install(new RenderEngine());

// universheet instance
const universheet = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA_DEMO);
// sheet.installPlugin(new RenderEngine());
univer.addUniverSheet(universheet);
univer.install(new UIPlugin());
// base-sheet
universheet.installPlugin(new SheetPlugin());

// universheet.installPlugin(new FormulaPlugin(DEFAULT_FORMULA_DATA_DEMO));

// ui-plugin-sheets
univer.install(
    new SheetUIPlugin({
        container: 'universheet',
        layout: {
            sheetContainerConfig: {
                infoBar: true,
                formulaBar: true,
                toolbar: true,
                sheetBar: true,
                countBar: true,
                rightMenu: true,
            },
        },
    })
);

// FormulaPlugin.create(DEFAULT_FORMULA_DATA_DEMO).installTo(universheet);
// FindPlugin.create().installTo(universheet);
universheet.installPlugin(new ClipboardPlugin());
universheet.installPlugin(new ImportXlsxPlugin());
