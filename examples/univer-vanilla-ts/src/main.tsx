import { UniverSheet, UniverDoc, UniverSlide, Univer } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { UniverComponentSheet } from '@univerjs/style-univer';
import { SheetPlugin } from '@univerjs/base-sheets';
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
import { BaseComponentPlugin } from '@univerjs/base-component';
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

const univerConfig = {
    container: 'universheet',
};

const univer = new Univer();

// base-render
univer.install(new RenderEngine());

// universheet
const sheet = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA_DEMO);
// sheet.installPlugin(new RenderEngine());
univer.addUniverSheet(sheet);

// base-sheet
sheet.installPlugin(
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

// ui
univer.install(new UniverComponentSheet());
univer.install(new BaseComponentPlugin(univerConfig));
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
