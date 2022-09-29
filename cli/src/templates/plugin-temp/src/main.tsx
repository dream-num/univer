import { defaultWorkbookData, UniverSheet } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import { UniverComponentSheet } from '@univer/style-universheet';

import { FilterPlugin } from '@univer/sheets-plugin-filter';
import { <%= projectUpperValue %>Plugin } from './<%= projectUpperValue %>Plugin';


const uiDefaultConfigUp = {
    containerId: 'universheet-demo',
    layout: 'auto',
};

const univerSheetUp = UniverSheet.newInstance(defaultWorkbookData);

univerSheetUp.installPlugin(new RenderEngine());
univerSheetUp.installPlugin(new UniverComponentSheet());

univerSheetUp.installPlugin(new SpreadsheetPlugin(uiDefaultConfigUp));
univerSheetUp.installPlugin(new FilterPlugin());
univerSheetUp.installPlugin(new <%= projectUpperValue %>Plugin());
