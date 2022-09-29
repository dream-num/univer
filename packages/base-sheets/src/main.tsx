import { defaultWorkbookData, UniverSheet } from '@univer/core';
import { UniverComponentSheet } from '@univer/style-universheet';
import { RenderEngine } from '@univer/base-render';
import { ClipboardPlugin } from '@univer/sheets-plugin-clipboard';
import { FormulaPlugin } from '@univer/sheets-plugin-formula';

const uiDefaultConfigUp = {
    containerId: 'universheet-demo-up',
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
};
const univerSheetUp = UniverSheet.newInstance(defaultWorkbookData);
univerSheetUp.installPlugin(new RenderEngine());
univerSheetUp.installPlugin(new UniverComponentSheet());
FormulaPlugin.create().installTo(univerSheetUp);

// init spreadsheet plugin first
import('./SpreadsheetPlugin').then(({ SpreadsheetPlugin }) => {
    let spreadsheetPlugin = new SpreadsheetPlugin(uiDefaultConfigUp);
    let clipboardPlugin = new ClipboardPlugin();
    univerSheetUp.installPlugin(spreadsheetPlugin);
    univerSheetUp.installPlugin(clipboardPlugin);
    (window as any).spreadsheetPlugin = spreadsheetPlugin;
});

// const uiDefaultConfigDown = {
//     containerId: 'universheet-demo-down',
//     layout: {
//         outerLeft: false,

//         outerRight: true,

//         innerLeft: false,

//         innerRight: false,

//         toolBar: true,

//         toolBarConfig: {
//             undoRedo: true,
//             font: true,
//         },
//         contentSplit: true,
//     },
// };

// const univerSheetDown = UniverSheet.newInstance(defaultWorkbookData);

// univerSheetDown.installPlugin(new StyleUniverSheet(uiDefaultConfigDown));

// univerSheetDown.installPlugin(new FilterPlugin());
// univerSheetDown.installPlugin(new SpreadsheetPlugin());
