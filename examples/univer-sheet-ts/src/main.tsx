import { Univer, LocaleType } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { DEFAULT_WORKBOOK_DATA_DEMO } from '@univerjs/common-plugin-data';
import { SheetPlugin } from '@univerjs/base-sheets';
import { initRender } from './init';

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
const univer = new Univer({
    locale: LocaleType.EN,
});

const renderEngine = new RenderEngine();
// base-render
univer.install(renderEngine);

// universheet instance
const universheet = univer.createUniverSheet(DEFAULT_WORKBOOK_DATA_DEMO);

// // universheet instance
// const universheet = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA_DEMO);
// // sheet.installPlugin(new RenderEngine());
// univer.addUniverSheet(universheet);
// base-sheet
const baseSheet = new SheetPlugin();
universheet.installPlugin(baseSheet);

initRender(renderEngine);
baseSheet.initCanvasView(renderEngine);

// universheet.installPlugin(new FormulaPlugin(DEFAULT_FORMULA_DATA_DEMO));

// ui-plugin-sheets
// univer.install(
//     new SheetUIPlugin({
//         container: 'universheet',
//         layout: {
//             sheetContainerConfig: {
//                 infoBar: true,
//                 formulaBar: true,
//                 toolbar: true,
//                 sheetBar: true,
//                 countBar: true,
//                 rightMenu: true,
//             },
//         },
//     })
// );

// FormulaPlugin.create(DEFAULT_FORMULA_DATA_DEMO).installTo(universheet);
// FindPlugin.create().installTo(universheet);
// universheet.installPlugin(new OperationPlugin());
// universheet.installPlugin(new ImportXlsxPlugin());
// universheet.installPlugin(new OverGridImagePlugin());
// universheet.installPlugin(new NumfmtPlugin());

// use for console test
declare global {
    interface Window {
        univer?: any;
    }
}
window.univer = univer;
