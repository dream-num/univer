import { LocaleType } from '@univerjs/core';

import { SlideContainerConfig } from './slide-container-config';
import { SlideToolbarConfig } from './toolbar-config';

export interface ILayout {
    slideContainerConfig?: SlideContainerConfig;
    toolbarConfig?: SlideToolbarConfig;
}

export interface ISlideUIPluginConfig {
    container?: HTMLElement | string;
    layout?: ILayout;
    locale?: LocaleType;
}
