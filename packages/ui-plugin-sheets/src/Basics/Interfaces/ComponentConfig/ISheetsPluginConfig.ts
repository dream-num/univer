import { SheetRightMenuConfig } from './RightMenuConfig';
import { SheetContainerConfig } from './SheetContainerConfig';
import { SheetToolBarConfig } from './ToolBarConfig';
import { Context } from '@univerjs/core/src/Basics/Context';

export interface ILayout {
    sheetContainerConfig?: SheetContainerConfig;
    toolBarConfig?: SheetToolBarConfig;
    rightMenuConfig?: SheetRightMenuConfig;
}

export interface ISheetsPluginConfig {
    container?: HTMLElement | string;
    layout?: ILayout;
    context?: Context;
}
