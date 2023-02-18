import { UniverSheet } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { DEFAULT_WORKBOOK_DATA } from '@univerjs/common-plugin-data';
import { SheetPlugin } from '@univerjs/base-sheets';

import { FilterPlugin } from '@univerjs/sheets-plugin-filter';
import { GroupPlugin } from './GroupPlugin';

const uiDefaultConfigUp = {
    container: 'universheet-demo',
};

const univerSheetUp = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);
univerSheetUp.installPlugin(new RenderEngine());
univerSheetUp.installPlugin(new UniverComponentSheet());
univerSheetUp.installPlugin(new SheetPlugin(uiDefaultConfigUp));
// univerSheetUp.installPlugin(new FilterPlugin());
// univerSheetUp.installPlugin(new GroupPlugin());
