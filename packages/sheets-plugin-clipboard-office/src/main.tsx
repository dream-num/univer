import { UniverSheet } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { SheetPlugin } from '@univer/base-sheets';
import { UniverComponentSheet } from '@univer/style-universheet';
import { DEFAULT_WORKBOOK_DATA } from '@univer/common-plugin-data';

import { ClipboardOfficePlugin } from './ClipboardOfficePlugin';
import { RegisterPlugin } from '@univer/common-plugin-register';

const uiDefaultConfigUp = {
    container: 'universheet',
    layout: 'auto',
};

const univerSheet = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);

univerSheet.installPlugin(new RenderEngine());
univerSheet.installPlugin(new UniverComponentSheet());

univerSheet.installPlugin(new SheetPlugin(uiDefaultConfigUp));
univerSheet.installPlugin(new RegisterPlugin());
univerSheet.installPlugin(new ClipboardOfficePlugin());
