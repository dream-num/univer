// import { Formula } from '@univer/sheets-plugin-formula';

import { defaultWorkbookData, UniverSheet } from '@univer/core';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import { UniverComponentSheet } from '@univer/style-universheet';
import { FilterPlugin } from './FilterPlugin';
// import { ArrayConvertor } from '@univer/common-plugin-collaboration';
// import { MatrixConvertor } from '@univer/common-plugin-collaboration';

const defaultWorkbookDataDown = {
    locale: 'en',
    creator: '',
    name: '',
    skin: 'dark',
    timeZone: '',
    createdTime: '',
    modifiedTime: '',
    appVersion: '',
    lastModifiedBy: '',
    sheets: [],
};
const uiDefaultConfigUp = {
    containerId: 'universheet-demo-up',
    layout: 'auto',
};
const uiDefaultConfigDown = {
    containerId: 'universheet-demo-down',
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
const univerSheetUp = UniverSheet.newInstance(defaultWorkbookData);
univerSheetUp.installPlugin(new UniverComponentSheet());

// import('@univer/base-sheets').then(({ SpreadsheetPlugin }) => {
//     univerSheetUp.installPlugin(new SpreadsheetPlugin(uiDefaultConfigUp));
// });

// import('./FilterPlugin').then(({ FilterPlugin }) => {
//     univerSheetUp.installPlugin(new FilterPlugin(uiDefaultConfigUp));
// });
univerSheetUp.installPlugin(new SpreadsheetPlugin(uiDefaultConfigUp));
univerSheetUp.installPlugin(new FilterPlugin(uiDefaultConfigUp));
