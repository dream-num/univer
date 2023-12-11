import { LocaleType, Univer } from '@univerjs/core';
import { defaultTheme } from '@univerjs/design';
import { UniverDocs } from '@univerjs/docs';
import { UniverDocsUI } from '@univerjs/docs-ui';
import { UniverRenderEngine } from '@univerjs/engine-render';
import { UniverUI } from '@univerjs/ui';
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
    locale: LocaleType.ZH_CN,
    locales,
});

// core plugins
univer.registerPlugin(UniverRenderEngine);
univer.registerPlugin(UniverUI, {
    container: 'univer-container',
    header: true,
    toolbar: true,
});
univer.registerPlugin(UniverDocs, {
    standalone: true,
});
univer.registerPlugin(UniverDocsUI, {
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
