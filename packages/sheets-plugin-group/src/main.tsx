import { UniverSheet } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { DEFAULT_WORKBOOK_DATA } from '@univer/common-plugin-data';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import { UniverComponentSheet } from '@univer/style-universheet';
import { FilterPlugin } from '@univer/sheets-plugin-filter';
import { GroupPlugin } from './GroupPlugin';

const uiDefaultConfigUp = {
    containerId: 'universheet-demo',
    layout: 'auto',
};

const univerSheetUp = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);
univerSheetUp.installPlugin(new RenderEngine());
univerSheetUp.installPlugin(new UniverComponentSheet());
univerSheetUp.installPlugin(new SpreadsheetPlugin(uiDefaultConfigUp));
univerSheetUp.installPlugin(new FilterPlugin());
univerSheetUp.installPlugin(new GroupPlugin());
