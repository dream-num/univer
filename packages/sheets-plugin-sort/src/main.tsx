import { UniverSheet } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { DEFAULT_WORKBOOK_DATA } from '@univerjs/common-plugin-data';

const uiDefaultConfigUp = {
    container: 'universheet-demo-up',
    // layout: 'auto',
    layout: {
        outerLeft: true,
        outerRight: true,
        innerLeft: false,
        innerRight: false,
        toolbar: true,
        toolbarConfig: {
            undoRedo: true,
            font: true,
        },
        contentSplit: true,
    },
};
const univerSheetUp = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);
univerSheetUp.installPlugin(new RenderEngine());
// univerSheetUp.installPlugin(new UniverComponentSheet());
// univerSheetUp.installPlugin(new SheetPlugin(uiDefaultConfigUp));
// univerSheetUp.installPlugin(new SortPlugin());
