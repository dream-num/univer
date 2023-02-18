import { UniverDoc } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';

import { DocPlugin } from './DocPlugin';
import { DEFAULT_DOCUMENT_DATA_EN } from '@univerjs/common-plugin-data';

const univerDocUp = UniverDoc.newInstance(DEFAULT_DOCUMENT_DATA_EN);

univerDocUp.installPlugin(new RenderEngine());
univerDocUp.installPlugin(new UniverComponentSheet());

univerDocUp.installPlugin(new DocPlugin());
