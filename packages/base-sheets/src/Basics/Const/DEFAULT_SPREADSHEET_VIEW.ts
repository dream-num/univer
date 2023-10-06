export enum SHEET_VIEW_KEY {
    MAIN = '__SpreadsheetRender__',
    ROW = '__SpreadsheetRowHeader__',
    COLUMN = '__SpreadsheetColumnHeader__',
    LEFT_TOP = '__SpreadsheetLeftTopPlaceholder__',
}

export enum VIEWPORT_KEY {
    VIEW_MAIN = 'viewMain',
    VIEW_MAIN_LEFT_TOP = 'viewMainLeftTop',
    VIEW_MAIN_TOP = 'viewMainTop',
    VIEW_MAIN_LEFT = 'viewMainLeft',

    VIEW_ROW_TOP = 'viewRowTop',
    VIEW_ROW_BOTTOM = 'viewRowBottom',
    VIEW_COLUMN_LEFT = 'viewColumnLeft',
    VIEW_COLUMN_RIGHT = 'viewColumnRight',
    VIEW_LEFT_TOP = 'viewLeftTop',
}

export const SHEET_COMPONENT_MAIN_LAYER_INDEX = 0;

export const SHEET_COMPONENT_HEADER_LAYER_INDEX = 2;
