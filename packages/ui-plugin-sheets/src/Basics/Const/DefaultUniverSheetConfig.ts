export const DefaultRightMenuConfig = {
    InsertRow: true,
    InsertColumn: true,
    AddRowTop: true,
    AddRowBottom: true,
    AddColumnLeft: true,
    AddColumnRight: true,
    DeleteRow: true,
    DeleteColumn: true,
    HideRow: true,
    ShowRow: true,
    RowHeight: true,
    HideColumn: true,
    ShowColumn: true,
    ColumnWidth: true,
    DeleteCell: true,
    ClearContent: true,
    Matrix: true,
};

export const DefaultToolbarConfig = {
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
    mergeCell: true,
};

export const DefaultSheetContainerConfig = {
    outerLeft: false,
    outerRight: false,
    header: true,
    footer: true,
    innerLeft: false,
    innerRight: false,
    frozenHeaderLT: false,
    frozenHeaderRT: false,
    frozenHeaderLM: false,
    frozenContent: false,
    infoBar: true,
    toolBar: true,
    rightMenu: true,
    countBar: true,
    sheetBar: true,
};

export const DefaultSheetUiConfig = {
    layout: {
        sheetContainerConfig: DefaultSheetContainerConfig,
        rightMenuConfig: DefaultRightMenuConfig,
        toolbarConfig: DefaultToolbarConfig,
    },
};
