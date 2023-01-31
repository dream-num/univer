import { BaseToolBarConfig, SheetToolBarConfig } from '../../Interfaces/ToolbarConfig/BaseToolBarConfig';

export const DefaultToolbarConfig: BaseToolBarConfig = {
    undo: true,
    redo: true, // Undo redo
    paintFormat: true, // Format brush
    currencyFormat: true, // currency format
    percentageFormat: true, // Percentage format
    numberDecrease: true, // 'Decrease the number of decimal places'
    numberIncrease: true, // 'Increase the number of decimal places
    moreFormats: true, // 'More Formats'
    font: true, // 'font'
    fontSize: true, // 'Font size'
    bold: true, // 'Bold (Ctrl+B)'
    italic: true, // 'Italic (Ctrl+I)'
    strikethrough: true, // 'Strikethrough (Alt+Shift+5)'
    underline: true, // 'Underline (Alt+Shift+6)'
    textColor: true, // 'Text color'
    fillColor: true, // 'Cell color'
    border: true, // 'border'
    horizontalAlignMode: true, // 'Horizontal alignment'
    verticalAlignMode: true, // 'Vertical alignment'
    textWrapMode: true, // 'Wrap mode'
    textRotateMode: true, // 'Text Rotation Mode'
};

export const DefaultSheetToolbarConfig: SheetToolBarConfig = {
    ...DefaultToolbarConfig,
    mergeCell: true,
};
