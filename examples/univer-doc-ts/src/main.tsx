import { UniverDoc } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { UniverComponentSheet } from '@univer/style-universheet';
import { DocPlugin } from '@univer/base-docs';
import { BaseComponentPlugin } from '@univer/base-component';
import { DEFAULT_DOCUMENT_DATA_EN } from '@univer/common-plugin-data';

const docPluginConfig = {
    container: 'univerdoc',
};
const univerDoc = UniverDoc.newInstance(DEFAULT_DOCUMENT_DATA_EN);

univerDoc.installPlugin(new RenderEngine());
univerDoc.installPlugin(new UniverComponentSheet());

univerDoc.installPlugin(new DocPlugin(docPluginConfig));
univerDoc.installPlugin(new BaseComponentPlugin());
