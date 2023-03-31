import { UniverSheet, UniverDoc, UniverSlide, Univer, PLUGIN_NAMES } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { SheetPlugin } from '@univerjs/base-sheets';
import { CanvasView as SlideCanvasView } from '@univerjs/base-slides';
import { SheetUIPlugin } from '@univerjs/ui-plugin-sheets';
import { SlideUIPlugin } from '@univerjs/ui-plugin-slides';
import { UIPlugin } from '@univerjs/base-ui';
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
import { ImportXlsxPlugin } from '@univerjs/sheets-plugin-import-xlsx';

// univer
const univer = new Univer();

// base-render
univer.install(new RenderEngine());

// universheet instance
const universheet = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA_DEMO);
univer.addUniverSheet(universheet);

univer.install(new UIPlugin())
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

// base-slides init CanvasView
univer.install(new SheetUIPlugin({
    container:'universheet'
}))


// render canvas without ui plugin
// const engine = univer.getGlobalContext().getPluginManager().getRequirePluginByName<RenderEngine>(PLUGIN_NAMES.BASE_RENDER).getEngine();
// let container = document.querySelector('#universheet') as HTMLElement

// // mount canvas to DOM container
// engine.setContainer(container);

// window.addEventListener('resize', () => {
//     engine.resize();
// });

// // should be clear
// setTimeout(() => {
//     engine.resize();
// }, 0);

// sheets-plugin-ui univer.install(new SheetsUI)
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
