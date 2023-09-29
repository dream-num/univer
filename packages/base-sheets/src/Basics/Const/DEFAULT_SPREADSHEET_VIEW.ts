export enum CANVAS_VIEW_KEY {
    MAIN_SCENE = 'mainScene',
    VIEW_MAIN = 'viewMain',
    VIEW_MAIN_LEFT_TOP = 'viewMainLeftTop',
    VIEW_MAIN_TOP = 'viewMainTop',
    VIEW_MAIN_LEFT = 'viewMainLeft',
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

export const SHEET_COMPONENT_MAIN_LAYER_INDEX = 0;

export const SHEET_COMPONENT_HEADER_LAYER_INDEX = 2;
