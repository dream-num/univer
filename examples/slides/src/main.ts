import { LocaleType, Univer } from '@univerjs/core';
import { greenTheme } from '@univerjs/design';
import { RenderEngine } from '@univerjs/engine-render';
import { SlidesPlugin } from '@univerjs/slides';
import { SlidesUIPlugin } from '@univerjs/slides-ui';
import { UIPlugin } from '@univerjs/ui';
import { DEFAULT_SLIDE_DATA } from 'data';

// package info
console.table({
    NODE_ENV: process.env.NODE_ENV,
    GIT_COMMIT_HASH: process.env.GIT_COMMIT_HASH,
    GIT_REF_NAME: process.env.GIT_REF_NAME,
    BUILD_TIME: process.env.BUILD_TIME,
});

// univer
const univer = new Univer({
    locale: LocaleType.EN_US,
    theme: greenTheme,
});

// base-render
univer.registerPlugin(RenderEngine);
univer.registerPlugin(UIPlugin, {
    container: 'univer-container',
    header: true,
    toolbar: true,
    footer: true,
    innerLeft: true,
});
univer.registerPlugin(SlidesPlugin);
univer.registerPlugin(SlidesUIPlugin);

univer.createUniverSlide(DEFAULT_SLIDE_DATA);

// use for console test
declare global {
    interface Window {
        univer?: Univer;
    }
}

window.univer = univer;
