import { UniverSheet } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { DEFAULT_WORKBOOK_DATA } from '@univerjs/common-plugin-data';

const uiDefaultConfigUp = {
    container: 'universheet-demo',
};

const univerSheetUp = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);
univerSheetUp.installPlugin(new RenderEngine());
// univerSheetUp.installPlugin(new UniverComponentSheet());
// univerSheetUp.installPlugin(new SheetPlugin(uiDefaultConfigUp));
// univerSheetUp.installPlugin(new FilterPlugin());
// univerSheetUp.installPlugin(new ProtectionPlugin());
