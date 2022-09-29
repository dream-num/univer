import { UniverSheet } from '@univer/core';
import { StyleUniverSheet } from '@univer/style-universheet';
import { ConditionalFormatPlugin } from './ConditionalFormatPlugin';

const defaultWorkbookData = {
    locale: 'zh',
    creator: '',
    name: '',
    skin: 'default',
    timeZone: '',
    createdTime: '',
    modifiedTime: '',
    appVersion: '',
    lastModifiedBy: '',
    sheets: [],
};

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

univerSheetUp.installPlugin(new StyleUniverSheet(uiDefaultConfigUp));
// univerSheetUp.installPlugin(new FilterPlugin());
univerSheetUp.installPlugin(new ConditionalFormatPlugin());

// const univerSheetDown = UniverSheet.newInstance({workBookData:defaultWorkbookDataDown});

// univerSheetDown.installPlugin(new StyleUniverSheet(uiDefaultConfigDown));

// univerSheetDown.installPlugin(new FilterPlugin());
// univerSheetDown.installPlugin(new ConditionalFormat());
