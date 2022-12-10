import { UniverSheet } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { UniverComponentSheet } from '@univer/style-universheet';
import { NumfmtPlugin } from '@univer/sheets-plugin-numfmt';
import { DEFAULT_WORKBOOK_DATA, DEFAULT_WORKBOOK_DATA_DEMO, DEFAULT_WORKBOOK_DATA_DOWN } from '@univer/common-plugin-data';
import { DEFAULT_FORMULA_DATA, DEFAULT_FORMULA_DATA_DEMO, FormulaPlugin } from '@univer/sheets-plugin-formula';
import { SheetPlugin } from './SheetPlugin';

const uiDefaultConfigUp = {
    container: 'universheet-demo-up',
    layout: {
        sheetContainerConfig:{
            infoBar:true,
            formulaBar:true,
            toolBar:true,
            sheetBar:true,
            countBar:true,
            rightMenu:true,
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

const univerSheetUp = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);
univerSheetUp.installPlugin(new RenderEngine());
univerSheetUp.installPlugin(new UniverComponentSheet());

let sheetPlugin = new SheetPlugin(uiDefaultConfigUp);

univerSheetUp.installPlugin(sheetPlugin);
univerSheetUp.installPlugin(new NumfmtPlugin());
FormulaPlugin.create(DEFAULT_FORMULA_DATA).installTo(univerSheetUp);

(window as any).sheetPlugin = sheetPlugin;

const uiDefaultConfigDown = {
    container: 'universheet-demo-down',
    layout:{
        sheetContainerConfig:{
            infoBar:true,
            formulaBar:true,
            toolBar:true,
            sheetBar:true,
            countBar:true,
            rightMenu:true,
        },
    },
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

const univerSheetDown = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA_DOWN);
univerSheetDown.installPlugin(new RenderEngine());
univerSheetDown.installPlugin(new UniverComponentSheet());

univerSheetDown.installPlugin(new SheetPlugin(uiDefaultConfigDown));
univerSheetDown.installPlugin(new NumfmtPlugin());
// FormulaPlugin.create(DEFAULT_FORMULA_DATA_DOWN).installTo(univerSheetDown);

// const uiDefaultConfigDemo = {
//     container: 'universheet-demo-demo',
//     selections: {
//         'sheet-0001': [
//             {
//                 selection: {
//                     startRow: 2,
//                     endRow: 2,
//                     startColumn: 3,
//                     endColumn: 3,
//                 },
//                 cell: {
//                     row: 2,
//                     column: 3,
//                 },
//             },
//         ],
//     },
// };

// const univerSheetDemo = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA_DEMO);
// univerSheetDemo.installPlugin(new RenderEngine());
// univerSheetDemo.installPlugin(new UniverComponentSheet());
// univerSheetDemo.installPlugin(new SheetPlugin(uiDefaultConfigDemo));
// FormulaPlugin.create(DEFAULT_FORMULA_DATA_DEMO).installTo(univerSheetDemo);
