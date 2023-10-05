import { RenderEngine } from '@univerjs/base-render';
import { SlidePlugin } from '@univerjs/base-slides';
import { greenTheme, UIPlugin } from '@univerjs/base-ui';
import { DEFAULT_SLIDE_DATA } from '@univerjs/common-plugin-data';
import { LocaleType, Univer } from '@univerjs/core';
import { SlideUIPlugin } from '@univerjs/ui-plugin-slides';

// univer
const univer = new Univer({
    locale: LocaleType.EN,
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
