import { UniverSheet, UniverDoc, UniverSlide } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { UniverComponentSheet } from '@univer/style-universheet';
import { SheetPlugin } from '@univer/base-sheets';
import {
    DEFAULT_FORMULA_DATA,
    DEFAULT_FORMULA_DATA_DEMO,
    DEFAULT_FORMULA_DATA_DEMO1,
    FormulaPlugin,
} from '@univer/sheets-plugin-formula';
import { NumfmtPlugin } from '@univer/sheets-plugin-numfmt';
import {
    DEFAULT_WORKBOOK_DATA,
    DEFAULT_WORKBOOK_DATA_DEMO,
    DEFAULT_WORKBOOK_DATA_DEMO1,
    DEFAULT_WORKBOOK_DATA_DEMO2,
    DEFAULT_WORKBOOK_DATA_DEMO3,
    DEFAULT_WORKBOOK_DATA_DEMO4,
    DEFAULT_WORKBOOK_DATA_DOWN,
} from '@univer/common-plugin-data';
import { ClipboardPlugin } from '@univer/sheets-plugin-clipboard';
import { BaseComponentPlugin } from '@univer/base-component';
import { ImportXlsxPlugin } from '@univer/sheets-plugin-import-xlsx';

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

// const univerSheetDemo = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA_DEMO);
// const univerSheetDemo = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA_DEMO1);
// const univerSheetDemo = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA_DEMO2);
// const univerSheetDemo = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA_DEMO3);
const univerSheetDemo = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA_DEMO);
univerSheetDemo.installPlugin(new RenderEngine());
univerSheetDemo.installPlugin(new UniverComponentSheet());
univerSheetDemo.installPlugin(new SheetPlugin(uiDefaultConfigDemo));
univerSheetDemo.installPlugin(new BaseComponentPlugin());
univerSheetDemo.installPlugin(new NumfmtPlugin());
// FormulaPlugin.create(DEFAULT_FORMULA_DATA_DEMO).installTo(univerSheetDemo);
// FormulaPlugin.create(DEFAULT_FORMULA_DATA_DEMO1).installTo(univerSheetDemo);

univerSheetDemo.installPlugin(new ClipboardPlugin());
univerSheetDemo.installPlugin(new ImportXlsxPlugin());
