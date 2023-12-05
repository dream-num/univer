import { DocsPlugin } from '@univerjs/docs';
import { RenderEngine } from '@univerjs/engine-render';
import { UIPlugin } from '@univerjs/ui';
import { LocaleType, Univer } from '@univerjs/core';
import { defaultTheme } from '@univerjs/design';
import { DocsUIPlugin } from '@univerjs/docs-ui';
import { DEFAULT_DOCUMENT_DATA_CN } from 'data';

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
univer.registerPlugin(DocsPlugin, {
    standalone: true,
});
univer.registerPlugin(DocsUIPlugin, {
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
