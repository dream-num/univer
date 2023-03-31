import { Univer, UniverDoc } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';

import { DocPlugin } from '@univerjs/base-docs';
import { DEFAULT_DOCUMENT_DATA_EN } from '@univerjs/common-plugin-data';
import { DocUIPlugin } from '@univerjs/ui-plugin-docs';
import { UIPlugin } from '@univerjs/base-ui';

// univer
const univer = new Univer();

// base-render
univer.install(new RenderEngine());

// univerdoc instance
const univerdoc = UniverDoc.newInstance(DEFAULT_DOCUMENT_DATA_EN);
univer.addUniverDoc(univerdoc);

univer.install(new UIPlugin())
univerdoc.installPlugin(new DocPlugin());
univer.install(
    new DocUIPlugin({
        container: 'univerdoc',
        layout: {
            docContainerConfig: {
                innerLeft: false,
            },
        },
    })
);

// univerdoc.installPlugin(new DocPlugin());
