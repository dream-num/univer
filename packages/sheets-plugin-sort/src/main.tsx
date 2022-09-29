import { UniverSheet } from '@univer/core';
import { StyleUniverSheet } from '@univer/style-universheet';
import { FilterPlugin } from '@univer/sheets-plugin-filter';
import { Formula } from '@univer/sheets-plugin-formula';
import { SortPlugin } from './SortPlugin';

// import { ArrayConvertor } from '@univer/common-plugin-collaboration';
// import { MatrixConvertor } from '@univer/common-plugin-collaboration';

// TODO : umd exclude plugin
// TODO : install extension auto

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
    // extensions: [new ArrayConvertor(), new MatrixConvertor()],
    styles: {
        1: {
            color: 'blue',
        },
        2: {
            color: 'red',
        },
    },
    sheets: [
        {
            cellData: {
                0: {
                    0: {
                        s: 1,
                        v: 1,
                        m: 1,
                    },
                    1: {
                        s: 11,
                        v: 11,
                        m: 11,
                    },
                },
                1: {
                    0: {
                        s: 2,
                        v: 2,
                        m: 2,
                    },
                    1: {
                        s: 22,
                        v: 22,
                        m: 22,
                    },
                },
                2: {
                    0: {
                        s: 3,
                        v: 3,
                        m: 3,
                    },
                    1: {
                        s: 33,
                        v: 33,
                        m: 33,
                    },
                    2: {
                        s: 333,
                        v: 333,
                        m: 333,
                    },
                },
            },
        },
    ],
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
    sheets: [{}],
};
const uiDefaultConfigUp = {
    containerId: 'universheet-demo-up',
    // layout: 'auto',
    layout: {
        outerLeft: true,
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
const uiDefaultConfigDown = {
    containerId: 'universheet-demo-down',
    layout: {
        outerLeft: false,
        outerRight: false,
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
univerSheetUp.installPlugin(new FilterPlugin());
univerSheetUp.installPlugin(new SortPlugin());
univerSheetUp.installPlugin(new Formula());

// const univerSheetDown = UniverSheet.newInstance(defaultWorkbookDataDown);

// univerSheetDown.installPlugin(new StyleUniverSheet(uiDefaultConfigDown));
// univerSheetDown.installPlugin(new FilterPlugin());
// univerSheetDown.installPlugin(new SortPlugin());
// univerSheetDown.installPlugin(new Formula());
