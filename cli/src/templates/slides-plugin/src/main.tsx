import { UniverSlide } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { SlidePlugin } from '@univer/base-slides';
import { UniverComponentSheet } from '@univer/style-universheet';
import { <%= projectUpperValue %>Plugin } from './<%= projectUpperValue %>Plugin';


const uiDefaultConfigUp = {
    container: 'universlide',
    layout: 'auto',
};

const univerSlide = UniverSlide.newInstance();

univerSlide.installPlugin(new RenderEngine());
univerSlide.installPlugin(new UniverComponentSheet());

univerSlide.installPlugin(new SlidePlugin(uiDefaultConfigUp));
univerSlide.installPlugin(new <%= projectUpperValue %>Plugin());
