import { UniverSheet } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { SheetPlugin } from '@univer/base-sheets';
import { UniverComponentSheet } from '@univer/style-universheet';
import { DEFAULT_WORKBOOK_DATA } from '@univer/common-plugin-data';

import { ImportXlsxPlugin } from './ImportXlsxPlugin';


const uiDefaultConfigUp = {
    container: 'universheet-demo',
    layout: 'auto',
};

const univerSheetUp = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);

univerSheetUp.installPlugin(new RenderEngine());
univerSheetUp.installPlugin(new UniverComponentSheet());

univerSheetUp.installPlugin(new SheetPlugin(uiDefaultConfigUp));
univerSheetUp.installPlugin(new ImportXlsxPlugin());
