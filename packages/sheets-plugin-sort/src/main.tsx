import { UniverSheet } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { DEFAULT_WORKBOOK_DATA } from '@univer/common-plugin-data';
import { SheetPlugin } from '@univer/base-sheets';
import { UniverComponentSheet } from '@univer/style-universheet';

const uiDefaultConfigUp = {
    container: 'universheet-demo-up',
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
const univerSheetUp = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);
univerSheetUp.installPlugin(new RenderEngine());
univerSheetUp.installPlugin(new UniverComponentSheet());
univerSheetUp.installPlugin(new SheetPlugin(uiDefaultConfigUp));
// univerSheetUp.installPlugin(new SortPlugin());
