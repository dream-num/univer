import { UniverDoc } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { DocPlugin } from '@univer/base-docs';
import { UniverComponentSheet } from '@univer/style-universheet';

import { <%= projectUpperValue %>Plugin } from './<%= projectUpperValue %>Plugin';


const uiDefaultConfigUp = {
    container: 'univerdoc',
};

const univerDoc = UniverDoc.newInstance();

univerDoc.installPlugin(new RenderEngine());
univerDoc.installPlugin(new UniverComponentSheet());

univerDoc.installPlugin(new DocPlugin(uiDefaultConfigUp));
univerDoc.installPlugin(new <%= projectUpperValue %>Plugin());
