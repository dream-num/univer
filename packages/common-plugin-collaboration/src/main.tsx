import { UniverSheet, UniverDoc, UniverSlide } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { SheetPlugin } from '@univerjs/base-sheets';
import { DocPlugin } from '@univerjs/base-docs';
import { SlidePlugin } from '@univerjs/base-slides';

import { DEFAULT_WORKBOOK_DATA } from '@univerjs/common-plugin-data';

import { CollaborationPlugin } from './CollaborationPlugin';

// sheet
const sheetPluginConfig = {
    container: 'universheet',
};

const univerSheet = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);

univerSheet.installPlugin(new RenderEngine());
univerSheet.installPlugin(new UniverComponentSheet());

univerSheet.installPlugin(new SheetPlugin(sheetPluginConfig));
univerSheet.installPlugin(new CollaborationPlugin());

// doc

const docPluginConfig = {
    container: 'univerdoc',
};
const univerDoc = UniverDoc.newInstance();

univerDoc.installPlugin(new RenderEngine());
univerDoc.installPlugin(new UniverComponentSheet());

univerDoc.installPlugin(new DocPlugin(docPluginConfig));
univerDoc.installPlugin(new CollaborationPlugin());

// SlidePlugin

const slidePluginConfig = {
    container: 'universlide',
};

const univerSlide = UniverSlide.newInstance();

univerSlide.installPlugin(new RenderEngine());
univerSlide.installPlugin(new UniverComponentSheet());

univerSlide.installPlugin(new SlidePlugin(slidePluginConfig));
univerSlide.installPlugin(new CollaborationPlugin());
