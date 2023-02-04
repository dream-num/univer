import { UniverSlide } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { UniverComponentSheet } from '@univerjs/style-univer';
import { SlidePlugin } from './SlidePlugin';
import { DEFAULT_SLIDE_DATA } from '@univerjs/common-plugin-data';

const slidePluginConfig = {
    container: 'universlide',
    layout: {
        innerLeft: true,
    },
};
const univerSlideUp = UniverSlide.newInstance(DEFAULT_SLIDE_DATA);

univerSlideUp.installPlugin(new RenderEngine());
univerSlideUp.installPlugin(new UniverComponentSheet());

univerSlideUp.installPlugin(new SlidePlugin(slidePluginConfig));
