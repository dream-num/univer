import { SheetRightMenuConfig } from './RightMenuConfig';
import { SheetContainerConfig } from './SheetContainerConfig';
import { SheetToolBarConfig } from './ToolBarConfig';
import { SheetContext } from '@univerjs/core';
import { LocaleType } from '../../Enum';

export interface ILayout {
    sheetContainerConfig?: SheetContainerConfig;
    toolBarConfig?: SheetToolBarConfig;
    rightMenuConfig?: SheetRightMenuConfig;
}

export interface ISheetsPluginConfig {
    container?: HTMLElement | string;
    layout?: ILayout;
    skin?: string;
    locale?: LocaleType;
    context?: SheetContext;
}
