import { Context } from '@univerjs/core/src/Basics/Context';
import { LocaleType } from '../../Enum';
import { ToolBarConfig } from './ToolbarConfig/BaseToolBarConfig';

/**
 * ShowContainerConfig
 */
export interface IShowContainerConfig {
    outerLeft?: boolean;

    outerRight?: boolean;

    header?: boolean;

    footer?: boolean;

    innerLeft?: boolean;

    innerRight?: boolean;

    frozenHeaderLT?: boolean;

    frozenHeaderRT?: boolean;

    frozenHeaderLM?: boolean;

    frozenContent?: boolean;

    infoBar?: boolean;

    formulaBar?: boolean;

    countBar?: boolean;

    sheetBar?: boolean;

    // Whether to show the toolbar
    toolBar?: boolean;

    rightMenu?: boolean;

    contentSplit?: boolean | string;
}

/**
 * RightMenuConfig
 */
export interface IHideRightMenuConfig {
    hideInsertRow?: boolean;
    hideInsertColumn?: boolean;
    hideAddRowTop?: boolean;
    hideAddRowBottom?: boolean;
    hideAddColumnLeft?: boolean;
    hideAddColumnRight?: boolean;
    hideDeleteRow?: boolean;
    hideDeleteColumn?: boolean;
    hideHideRow?: boolean;
    hideShowRow?: boolean;
    hideRowHeight?: boolean;
    hideHideColumn?: boolean;
    hideShowColumn?: boolean;
    hideColumnWidth?: boolean;
    hideDeleteCell?: boolean;
    hideClearContent?: boolean;
    hideMatrix?: boolean;
}

export interface ILayout {
    sheetContainerConfig?: IShowContainerConfig;
    toolBarConfig?: ToolBarConfig;
    rightMenuConfig?: IHideRightMenuConfig;
}

export interface UniverConfig {
    container?: HTMLElement | string;
    layout?: ILayout;
    skin?: string;
    locale?: LocaleType;
    context?: Context;
}
