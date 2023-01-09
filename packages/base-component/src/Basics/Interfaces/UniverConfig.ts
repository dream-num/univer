import { ContextBase } from '@univer/core';

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
 * ToolBarConfig
 */
export interface IShowToolBarConfig {
    undoRedo?: boolean; // Undo redo
    paintFormat?: boolean; // Format brush
    currencyFormat?: boolean; // currency format
    percentageFormat?: boolean; // Percentage format
    numberDecrease?: boolean; // 'Decrease the number of decimal places'
    numberIncrease?: boolean; // 'Increase the number of decimal places
    font?: boolean; // 'font'
    fontSize?: boolean; // 'Font size'
    bold?: boolean; // 'Bold (Ctrl+B)'
    italic?: boolean; // 'Italic (Ctrl+I)'
    strikethrough?: boolean; // 'Strikethrough (Alt+Shift+5)'
    underline?: boolean; // 'Underline (Alt+Shift+6)'
    textColor?: boolean; // 'Text color'
    fillColor?: boolean; // 'Cell color'
    border?: boolean; // 'border'
    mergeCell?: boolean; // 'Merge cells'
    horizontalAlignMode?: boolean; // 'Horizontal alignment'
    verticalAlignMode?: boolean; // 'Vertical alignment'
    textWrapMode?: boolean; // 'Wrap mode'
    textRotateMode?: boolean; // 'Text Rotation Mode'
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
    toolBarConfig?: IShowToolBarConfig;
    rightMenuConfig?: IHideRightMenuConfig;
}

export interface UniverConfig {
    container?: HTMLElement | string;
    layout?: ILayout;
    skin?: string;
    context?: ContextBase;
}
