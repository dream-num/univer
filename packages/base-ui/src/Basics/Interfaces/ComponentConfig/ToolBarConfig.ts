// 基础工具栏配置
export interface BaseToolbarConfig {
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
}

// sheet工具栏配置
export interface SheetToolbarConfig extends BaseToolbarConfig {
    mergeCell?: boolean; // 'Merge cells'
}

export interface DocToolbarConfig extends BaseToolbarConfig {}

export interface SlideToolbarConfig extends BaseToolbarConfig {}

export interface ToolbarConfig extends SheetToolbarConfig, DocToolbarConfig, SlideToolbarConfig {}
