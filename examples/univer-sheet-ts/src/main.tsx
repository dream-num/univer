import { UniverSheet, UniverDoc, UniverSlide, Univer } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { SheetPlugin } from '@univerjs/base-sheets';
import { SheetUIPlugin } from '@univerjs/ui-plugin-sheets';
import {
    DEFAULT_FORMULA_DATA,
    DEFAULT_FORMULA_DATA_DEMO,
    DEFAULT_FORMULA_DATA_DEMO1,
    FormulaPlugin,
} from '@univerjs/sheets-plugin-formula';
import { NumfmtPlugin } from '@univerjs/sheets-plugin-numfmt';
import {
    DEFAULT_WORKBOOK_DATA,
    DEFAULT_WORKBOOK_DATA_DEMO,
    DEFAULT_WORKBOOK_DATA_DEMO1,
    DEFAULT_WORKBOOK_DATA_DEMO2,
    DEFAULT_WORKBOOK_DATA_DEMO3,
    DEFAULT_WORKBOOK_DATA_DEMO4,
    DEFAULT_WORKBOOK_DATA_DOWN,
} from '@univerjs/common-plugin-data';
import { ClipboardPlugin } from '@univerjs/sheets-plugin-clipboard';
import { BaseComponentPlugin } from '@univerjs/base-ui';
import { ImportXlsxPlugin } from '@univerjs/sheets-plugin-import-xlsx';

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

// base-sheet
universheet.installPlugin(
    new SheetPlugin({
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
    })
);
FormulaPlugin.create(DEFAULT_FORMULA_DATA_DEMO1).installTo(universheet);
// universheet.installPlugin(new FormulaPlugin(DEFAULT_FORMULA_DATA_DEMO));

// // ui TODO: 不要安装
// univer.install(new UniverComponentSheet());
// univer.install(new BaseComponentPlugin(univerConfig));

univer.install(
    new SheetUIPlugin({
        container: 'universheet',
    })
);
// sheets-plugin-ui univer.install(new SheetsUI)
// sheets-plugin-ui univer.install(new SheetsUI
// const univerSheetDemo = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA_DEMO);
// const univerSheetDemo = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA_DEMO1);
// const univerSheetDemo = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA_DEMO2);
// const univerSheetDemo = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA_DEMO3);
// const univerSheetDemo = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA_DEMO);
// univerSheetDemo.installPlugin(new RenderEngine());
// univerSheetDemo.installPlugin(new UniverComponentSheet());
// univerSheetDemo.installPlugin(new SheetPlugin(uiDefaultConfigDemo));
// univerSheetDemo.installPlugin(new BaseComponentPlugin());
// univerSheetDemo.installPlugin(new NumfmtPlugin());
// FormulaPlugin.create(DEFAULT_FORMULA_DATA_DEMO).installTo(univerSheetDemo);
// FormulaPlugin.create(DEFAULT_FORMULA_DATA_DEMO1).installTo(univerSheetDemo);

// univerSheetDemo.installPlugin(new ClipboardPlugin());
// univerSheetDemo.installPlugin(new ImportXlsxPlugin());
