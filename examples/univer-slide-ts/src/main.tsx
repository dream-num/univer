import { Univer, UniverSlide } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';

import { SlidePlugin } from '@univerjs/base-slides';
import { DEFAULT_SLIDE_DATA } from '@univerjs/common-plugin-data';
import {SlideUIPlugin} from '@univerjs/ui-plugin-slides'
import { UIPlugin } from '@univerjs/base-ui';

// univer
const univer = new Univer();

// base-render
univer.install(new RenderEngine());

// universlide instance
const universlide = UniverSlide.newInstance(DEFAULT_SLIDE_DATA);
univer.addUniverSlide(universlide);

univer.install(new UIPlugin())
universlide.installPlugin(new SlidePlugin());
univer.install(new SlideUIPlugin({
    container: 'universlide',
    layout: {
        slideContainerConfig:{
            innerLeft: true,
        }
    },
}))
