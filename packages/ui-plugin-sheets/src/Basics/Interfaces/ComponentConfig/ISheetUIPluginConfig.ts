import { SheetRightMenuConfig } from './RightMenuConfig';
import { SheetContainerConfig } from './SheetContainerConfig';
import { SheetToolbarConfig } from './ToolbarConfig';
import { Context } from '@univerjs/core/src/Basics/Context';

export interface ILayout {
    sheetContainerConfig?: SheetContainerConfig;
    toolbarConfig?: SheetToolbarConfig;
    rightMenuConfig?: SheetRightMenuConfig;
}

export interface ISheetUIPluginConfig {
    container?: HTMLElement | string;
    layout?: ILayout;
}
