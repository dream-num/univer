import { UniverDoc } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { DocPlugin } from '@univerjs/base-docs';


import { <%= projectUpperValue %>Plugin } from './<%= projectUpperValue %>Plugin';


const uiDefaultConfigUp = {
    container: 'univerdoc',
};

const univerDoc = UniverDoc.newInstance();

univerDoc.installPlugin(new RenderEngine());
univerDoc.installPlugin(new UniverComponentSheet());

univerDoc.installPlugin(new DocPlugin(uiDefaultConfigUp));
univerDoc.installPlugin(new <%= projectUpperValue %>Plugin());
