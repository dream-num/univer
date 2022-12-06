import { UniverSheet } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { SheetPlugin } from '@univer/base-sheets';
import { UniverComponentSheet } from '@univer/style-universheet';
import { DEFAULT_WORKBOOK_DATA } from '@univer/common-plugin-data';

import { <%= projectUpperValue %>Plugin } from './<%= projectUpperValue %>Plugin';


const uiDefaultConfigUp = {
    container: 'universheet',
};

const univerSheet = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);

univerSheet.installPlugin(new RenderEngine());
univerSheet.installPlugin(new UniverComponentSheet());

univerSheet.installPlugin(new SheetPlugin(uiDefaultConfigUp));
univerSheet.installPlugin(new <%= projectUpperValue %>Plugin());
