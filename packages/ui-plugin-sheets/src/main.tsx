import { UniverSheet, UniverDoc, UniverSlide } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { SheetPlugin } from '@univerjs/base-sheets';
import { UniverComponentSheet } from '@univerjs/style-univer';
import { DEFAULT_WORKBOOK_DATA } from '@univerjs/common-plugin-data';

import { SheetUIPlugin } from './SheetUIPlugin';

// sheet
const sheetPluginConfig = {
    container: 'universheet',
};

const univerSheet = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);

univerSheet.installPlugin(new RenderEngine());
univerSheet.installPlugin(new UniverComponentSheet());

univerSheet.installPlugin(new SheetPlugin(sheetPluginConfig));
univerSheet.installPlugin(new SheetUIPlugin());