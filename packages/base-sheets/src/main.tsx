import { UniverSheet } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { DEFAULT_WORKBOOK_DATA } from '@univer/common-plugin-data';
import { UniverComponentSheet } from '@univer/style-universheet';
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
const univerSheetUp = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);
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
