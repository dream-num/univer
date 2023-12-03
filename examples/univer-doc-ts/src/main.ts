import { DocPlugin } from '@univerjs/docs';
import { RenderEngine } from '@univerjs/engine-render';
import { UIPlugin } from '@univerjs/ui';
import { LocaleType, Univer } from '@univerjs/core';
import { defaultTheme } from '@univerjs/design';
import { DocUIPlugin } from '@univerjs/docs-ui';
import { DEFAULT_DOCUMENT_DATA_CN } from 'univer-data';

import { locales } from './locales';

// univer
const univer = new Univer({
    theme: defaultTheme,
    locale: LocaleType.EN_US,
    locales,
});

// core plugins
univer.registerPlugin(RenderEngine);
univer.registerPlugin(UIPlugin, {
    container: 'univer-container',
    header: true,
    toolbar: true,
});
univer.registerPlugin(DocPlugin, {
    standalone: true,
});
univer.registerPlugin(DocUIPlugin, {
    container: 'univerdoc',
    layout: {
        docContainerConfig: {
            innerLeft: false,
        },
    },
});

univer.createUniverDoc(DEFAULT_DOCUMENT_DATA_CN);

// use for console test
declare global {
    interface Window {
        univer?: Univer;
    }
}

window.univer = univer;
