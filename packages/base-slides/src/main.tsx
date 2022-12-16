import { UniverSlide } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { UniverComponentSheet } from '@univer/style-universheet';
import { SlidePlugin } from './SlidePlugin';
import { DEFAULT_SLIDE_DATA } from '@univer/common-plugin-data';

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
