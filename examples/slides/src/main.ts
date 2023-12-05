import { RenderEngine } from '@univerjs/engine-render';
import { SlidesPlugin } from '@univerjs/slides';
import { UIPlugin } from '@univerjs/ui';
import { LocaleType, Univer } from '@univerjs/core';
import { greenTheme } from '@univerjs/design';
import { SlidesUIPlugin } from '@univerjs/slides-ui';
import { DEFAULT_SLIDE_DATA } from 'data';

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
