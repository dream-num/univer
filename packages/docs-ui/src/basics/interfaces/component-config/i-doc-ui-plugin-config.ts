export interface ILayout {
    docContainerConfig?: DocContainerConfig;
    toolbarConfig?: DocToolbarConfig;
}

export interface IUniverDocsUIConfig {
    container?: HTMLElement | string;
    layout?: ILayout;
}

export interface DocContainerConfig {
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

    toolbar?: boolean;

    contentSplit?: boolean | string;
}

// doc工具栏配置
export interface DocToolbarConfig {
    undo?: boolean; // Undo redo
    redo?: boolean; // Undo redo
    paintFormat?: boolean; // Format brush
    currencyFormat?: boolean; // currency format
    percentageFormat?: boolean; // Percentage format
    numberDecrease?: boolean; // 'Decrease the number of decimal places'
    numberIncrease?: boolean; // 'Increase the number of decimal places
    font?: boolean; // 'font'
    moreFormats?: boolean;
    fontSize?: boolean; // 'Font size'
    bold?: boolean; // 'Bold (Ctrl+B)'
    italic?: boolean; // 'Italic (Ctrl+I)'
    strikethrough?: boolean; // 'Strikethrough (Alt+Shift+5)'
    underline?: boolean; // 'Underline (Alt+Shift+6)'
    textColor?: boolean; // 'Text color'
    fillColor?: boolean; // 'Cell color'
    border?: boolean; // 'border'
    horizontalAlignMode?: boolean; // 'Horizontal alignment'
    verticalAlignMode?: boolean; // 'Vertical alignment'
    textWrapMode?: boolean; // 'Wrap mode'
    textRotateMode?: boolean; // 'Text Rotation Mode'
    mergeCell?: boolean; // 'Merge cells'
}
