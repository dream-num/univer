export enum CANVAS_VIEW_KEY {
    MAIN_SCENE = 'mainScene',
    VIEW_MAIN = 'viewMain',
    VIEW_TOP = 'viewTop',
    VIEW_LEFT = 'viewLeft',
    VIEW_LEFT_TOP = 'viewLeftTop',
    SHEET_VIEW = 'sheetView',
    DRAG_LINE_VIEW = 'dragLineView',
    CELL_EDITOR = 'cellEditor',
    SELECTION_VIEW = 'selectionView',
    HEADER_ACTION_VIEW = 'headerActionView',
}

export enum SHEET_VIEW_KEY {
    MAIN = '__SpreadsheetRender__',
    ROW = '__SpreadsheetRowHeader__',
    COLUMN = '__SpreadsheetColumnHeader__',
    LEFT_TOP = '__SpreadsheetLeftTopPlaceholder__',
}
