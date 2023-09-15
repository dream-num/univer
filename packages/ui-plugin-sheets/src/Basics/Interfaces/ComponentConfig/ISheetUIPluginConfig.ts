import { LocaleType } from '@univerjs/core';

import { SheetRightMenuConfig } from './RightMenuConfig';
import { SheetContainerConfig } from './SheetContainerConfig';
import { SheetToolbarConfig } from './ToolbarConfig';

export interface ILayout {
    sheetContainerConfig?: SheetContainerConfig;
    toolbarConfig?: SheetToolbarConfig;
    rightMenuConfig?: SheetRightMenuConfig;
}

export interface ISheetUIPluginConfig {
    container?: HTMLElement | string;
    layout?: ILayout;
    locale?: LocaleType;
}
