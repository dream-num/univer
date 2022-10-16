import { UniverSheet } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { DEFAULT_WORKBOOK_DATA } from '@univer/common-plugin-data';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import { UniverComponentSheet } from '@univer/style-universheet';
import { FindPlugin } from './FindPlugin';

const uiDefaultConfigUp = {
    container: 'universheet-demo-up',
    layout: 'auto',
};
const uiDefaultConfigDown = {
    container: 'universheet-demo-down',
    layout: {
        outerLeft: false,

        outerRight: true,

        innerLeft: false,

        innerRight: false,

        toolBar: true,

        toolBarConfig: {
            undoRedo: true,
            font: true,
        },
        contentSplit: true,
    },
};
const uiDefaultConfigLeft = {
    container: 'universheet-demo-left',
    layout: 'auto',
};
const uiDefaultConfigRight = {
    container: 'universheet-demo-right',
    layout: 'auto',
};
const univerSheetUp = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);
univerSheetUp.installPlugin(new RenderEngine());
univerSheetUp.installPlugin(new UniverComponentSheet());
univerSheetUp.installPlugin(new SpreadsheetPlugin(uiDefaultConfigUp));
univerSheetUp.installPlugin(new FindPlugin());

const univerSheetDown = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);
univerSheetDown.installPlugin(new RenderEngine());
univerSheetDown.installPlugin(new UniverComponentSheet());
univerSheetDown.installPlugin(new SpreadsheetPlugin(uiDefaultConfigDown));
univerSheetDown.installPlugin(new FindPlugin());

const univerSheetLeft = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);
univerSheetLeft.installPlugin(new RenderEngine());
univerSheetLeft.installPlugin(new UniverComponentSheet());
univerSheetLeft.installPlugin(new SpreadsheetPlugin(uiDefaultConfigLeft));
univerSheetLeft.installPlugin(new FindPlugin());

const univerSheetRight = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);
univerSheetRight.installPlugin(new RenderEngine());
univerSheetRight.installPlugin(new UniverComponentSheet());
univerSheetRight.installPlugin(new SpreadsheetPlugin(uiDefaultConfigRight));
univerSheetRight.installPlugin(new FindPlugin());
