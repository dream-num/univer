import { UniverDoc } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';

import { DocPlugin } from '@univerjs/base-docs';
import { BaseComponentPlugin } from '@univerjs/base-ui';
import { DEFAULT_DOCUMENT_DATA_EN } from '@univerjs/common-plugin-data';

const docPluginConfig = {
    container: 'univerdoc',
};
const univerDoc = UniverDoc.newInstance(DEFAULT_DOCUMENT_DATA_EN);

univerDoc.installPlugin(new RenderEngine());
univerDoc.installPlugin(new UniverComponentSheet());

univerDoc.installPlugin(new DocPlugin(docPluginConfig));
univerDoc.installPlugin(new BaseComponentPlugin());
