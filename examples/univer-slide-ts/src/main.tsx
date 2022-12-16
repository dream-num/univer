import { UniverSlide } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { UniverComponentSheet } from '@univer/style-universheet';
import { SlidePlugin } from '@univer/base-slides';
import { BaseComponentPlugin } from '@univer/base-component';
import { DEFAULT_SLIDE_DATA } from '@univer/common-plugin-data';

const slidePluginConfig = {
    container: 'universlide',
};

const univerSlide = UniverSlide.newInstance(DEFAULT_SLIDE_DATA);

univerSlide.installPlugin(new RenderEngine());
univerSlide.installPlugin(new UniverComponentSheet());

univerSlide.installPlugin(new SlidePlugin(slidePluginConfig));
univerSlide.installPlugin(new BaseComponentPlugin());