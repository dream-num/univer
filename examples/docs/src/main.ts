import { LocaleType, Univer } from '@univerjs/core';
import { defaultTheme } from '@univerjs/design';
import { DocsPlugin } from '@univerjs/docs';
import { DocsUIPlugin } from '@univerjs/docs-ui';
import { RenderEngine } from '@univerjs/engine-render';
import { UIPlugin } from '@univerjs/ui';
import { DEFAULT_DOCUMENT_DATA_CN } from 'data';

import { locales } from './locales';

// package info
console.table({
    NODE_ENV: process.env.NODE_ENV,
    GIT_COMMIT_HASH: process.env.GIT_COMMIT_HASH,
    GIT_REF_NAME: process.env.GIT_REF_NAME,
    BUILD_TIME: process.env.BUILD_TIME,
});

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
