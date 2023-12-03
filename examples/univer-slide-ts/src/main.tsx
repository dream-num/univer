import { RenderEngine } from '@univerjs/engine-render';
import { SlidePlugin } from '@univerjs/slides';
import { UIPlugin } from '@univerjs/ui';
import { LocaleType, Univer } from '@univerjs/core';
import { greenTheme } from '@univerjs/design';
import { SlideUIPlugin } from '@univerjs/slides-ui';
import { DEFAULT_SLIDE_DATA } from 'univer-data';

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
univer.registerPlugin(SlidePlugin);
univer.registerPlugin(SlideUIPlugin);

univer.createUniverSlide(DEFAULT_SLIDE_DATA);

// use for console test
declare global {
    interface Window {
        univer?: Univer;
    }
}

window.univer = univer;
