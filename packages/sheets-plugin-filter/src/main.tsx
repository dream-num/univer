import { UniverSheet } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { DEFAULT_WORKBOOK_DATA } from '@univer/common-plugin-data';
import { SheetPlugin } from '@univer/base-sheets';
import { UniverComponentSheet } from '@univer/style-universheet';

const uiDefaultConfigUp = {
    container: 'universheet-demo-up',
    layout: 'auto',
};

const univerSheetUp = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);
univerSheetUp.installPlugin(new RenderEngine());
univerSheetUp.installPlugin(new UniverComponentSheet());
univerSheetUp.installPlugin(new SheetPlugin(uiDefaultConfigUp));
// univerSheetUp.installPlugin(new FilterPlugin());
