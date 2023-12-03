import { LocaleType } from '@univerjs/core';

import { SheetContainerConfig } from './sheet-container-config';
import { SheetToolbarConfig } from './toolbar-config';

export interface ILayout {
    sheetContainerConfig?: SheetContainerConfig;
    toolbarConfig?: SheetToolbarConfig;
}

export interface ISheetUIPluginConfig {
    container?: HTMLElement | string;
    layout?: ILayout;
    locale?: LocaleType;
}
