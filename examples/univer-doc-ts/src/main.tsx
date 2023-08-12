import { LocaleType, Univer } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';

import { DocPlugin } from '@univerjs/base-docs';
import { DEFAULT_DOCUMENT_DATA_EN } from '@univerjs/common-plugin-data';
import { DocUIPlugin } from '@univerjs/ui-plugin-docs';

const univer = new Univer({
    locale: LocaleType.EN,
});

univer.createUniverDoc(DEFAULT_DOCUMENT_DATA_EN);

univer.registerPlugin(RenderEngine);
univer.registerPlugin(DocPlugin);
univer.registerPlugin(DocUIPlugin, {
    container: 'univerdoc',
    layout: {
        docContainerConfig: {
            innerLeft: false,
        },
    },
});
