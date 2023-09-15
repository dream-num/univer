import { LocaleType } from '@univerjs/core';

import { SlideContainerConfig } from './SlideContainerConfig';
import { SlideToolbarConfig } from './ToolbarConfig';

export interface ILayout {
    slideContainerConfig?: SlideContainerConfig;
    toolbarConfig?: SlideToolbarConfig;
}

export interface ISlideUIPluginConfig {
    container?: HTMLElement | string;
    layout?: ILayout;
    locale?: LocaleType;
}
