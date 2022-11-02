import { UniverSheet } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { DEFAULT_WORKBOOK_DATA } from '@univer/common-plugin-data';
import { UniverComponentSheet } from '@univer/style-universheet';
import { ClipboardPlugin } from '@univer/sheets-plugin-clipboard';
import { NumfmtPlugin } from '@univer/sheets-plugin-numfmt';
import { DEFAULT_FORMULA_DATA, FormulaPlugin } from '@univer/sheets-plugin-formula';

const uiDefaultConfigUp = {
    container: 'universheet-demo-up',
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
FormulaPlugin.create(DEFAULT_FORMULA_DATA).installTo(univerSheetUp);

// init spreadsheet plugin first
import('./SheetPlugin').then(({ SheetPlugin }) => {
    let sheetPlugin = new SheetPlugin(uiDefaultConfigUp);
    let clipboardPlugin = new ClipboardPlugin();
    // let numfmtPlugin = new NumfmtPlugin();
    univerSheetUp.installPlugin(sheetPlugin);
    univerSheetUp.installPlugin(clipboardPlugin);
    // univerSheetUp.installPlugin(new FindPlugin());
    univerSheetUp.installPlugin(new NumfmtPlugin());
    (window as any).sheetPlugin = sheetPlugin;
});
