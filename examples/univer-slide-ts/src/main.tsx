import { UniverSlide } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';

import { SlidePlugin } from '@univerjs/base-slides';
import { BaseComponentPlugin } from '@univerjs/base-ui';
import { DEFAULT_SLIDE_DATA } from '@univerjs/common-plugin-data';

const slidePluginConfig = {
    container: 'universlide',
    layout: {
        innerLeft: true,
    },
};

const univerSlide = UniverSlide.newInstance(DEFAULT_SLIDE_DATA);

univerSlide.installPlugin(new RenderEngine());
univerSlide.installPlugin(new UniverComponentSheet());

univerSlide.installPlugin(new SlidePlugin(slidePluginConfig));
univerSlide.installPlugin(new BaseComponentPlugin());
