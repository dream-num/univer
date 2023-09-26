import { LocaleType } from '@univerjs/core';

import { SheetContainerConfig } from './SheetContainerConfig';
import { SheetToolbarConfig } from './ToolbarConfig';

export interface ILayout {
    sheetContainerConfig?: SheetContainerConfig;
    toolbarConfig?: SheetToolbarConfig;
}

export interface ISheetUIPluginConfig {
    container?: HTMLElement | string;
    layout?: ILayout;
    locale?: LocaleType;
}
