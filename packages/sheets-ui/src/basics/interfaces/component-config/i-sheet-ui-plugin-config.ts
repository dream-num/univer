import type { LocaleType } from '@univerjs/core';

import type { SheetContainerConfig } from './sheet-container-config';
import type { SheetToolbarConfig } from './toolbar-config';

export interface ILayout {
    sheetContainerConfig?: SheetContainerConfig;
    toolbarConfig?: SheetToolbarConfig;
}

export interface IUniverSheetsUIConfig {
    container?: HTMLElement | string;
    layout?: ILayout;
    locale?: LocaleType;
}
