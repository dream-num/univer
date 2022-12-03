import { ISheetPluginConfig } from '../Interfaces/SpreadsheetConfig';

export const DefaultSheetContainerConfig = {
    outerLeft: false,

    outerRight: false,

    header: true,

    footer: true,

    innerLeft: false,

    innerRight: false,

    frozenHeaderLT: true,

    frozenHeaderRT: true,

    frozenHeaderLM: true,

    frozenContent: true,

    infoBar: true,

    formulaBar: true,

    toolBar: true,

    countBar: true,

    sheetBar: true,

    contentSplit: false,

    rightMenu: true,
};

export const DefaultToolbarConfig = {
    undoRedo: true, // Undo redo
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
    mergeCell: true, // 'Merge cells'
    horizontalAlignMode: true, // 'Horizontal alignment'
    verticalAlignMode: true, // 'Vertical alignment'
    textWrapMode: true, // 'Wrap mode'
    textRotateMode: true, // 'Text Rotation Mode'
};

export const DefaultRightMenuConfig = {
    hideInsertRow: false,
    hideInsertColumn: false,
    hideAddRowTop: true,
    hideAddRowBottom: true,
    hideAddColumnLeft: true,
    hideAddColumnRight: true,
    hideDeleteRow: false,
    hideDeleteColumn: false,
    hideHideRow: true,
    hideShowRow: true,
    hideRowHeight: false,
    hideHideColumn: true,
    hideShowColumn: true,
    hideColumnWidth: false,
    hideDeleteCell: false,
    hideClearContent: false,
    hideMatrix: true,
};

export const DEFAULT_SPREADSHEET_PLUGIN_DATA: ISheetPluginConfig = {
    container: 'universheet',
    layout: {
        sheetContainerConfig: DefaultSheetContainerConfig,
        toolBarConfig: DefaultToolbarConfig,
        rightMenuConfig: DefaultRightMenuConfig,
    },
    selections: {
        'sheet-01': [
            {
                selection: {
                    startRow: 0,
                    endRow: 0,
                    startColumn: 0,
                    endColumn: 0,
                },
            },
        ],
        'sheet-02': [
            {
                selection: {
                    startRow: 0,
                    endRow: 0,
                    startColumn: 0,
                    endColumn: 0,
                },
            },
        ],
    },
};
