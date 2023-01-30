import { UniverSlide } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { SlidePlugin } from '@univerjs/base-slides';
import { UniverComponentSheet } from '@univerjs/style-univer';
import { <%= projectUpperValue %>Plugin } from './<%= projectUpperValue %>Plugin';


const uiDefaultConfigUp = {
    container: 'universlide',

};

const univerSlide = UniverSlide.newInstance();

univerSlide.installPlugin(new RenderEngine());
univerSlide.installPlugin(new UniverComponentSheet());

univerSlide.installPlugin(new SlidePlugin(uiDefaultConfigUp));
univerSlide.installPlugin(new <%= projectUpperValue %>Plugin());
