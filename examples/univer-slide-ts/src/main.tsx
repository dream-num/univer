import { LocaleType, Univer } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';

import { SlidePlugin } from '@univerjs/base-slides';
import { DEFAULT_SLIDE_DATA } from '@univerjs/common-plugin-data';
import { SlideUIPlugin } from '@univerjs/ui-plugin-slides';

// univer
const univer = new Univer({
    locale: LocaleType.EN,
});

univer.createUniverSlide(DEFAULT_SLIDE_DATA);

// base-render
univer.registerPlugin(RenderEngine);
univer.registerPlugin(SlidePlugin);
univer.registerPlugin(SlideUIPlugin, {
    container: 'universlide',
    layout: {
        slideContainerConfig: {
            innerLeft: true,
        },
    },
});

// use for console test
declare global {
    interface Window {
        univer?: any;
    }
}

window.univer = univer;
