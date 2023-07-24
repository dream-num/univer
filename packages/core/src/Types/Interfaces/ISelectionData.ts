import { IRangeData, IRangeType } from './IRangeData';

/**
 * Properties of selection data
 */
export interface ISelectionData {
    selection?: IRangeType | IRangeType[];
    cell?: IRangeType;
}

export interface IPosition {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

export interface ICellInfo extends IPosition {
    row: number; // current cell, if cell is in merge,  isMerged is true, If the cell is in the upper left corner, isMergedMainCell is true.
    column: number;

    isMerged: boolean;

    isMergedMainCell: boolean;

    mergeInfo: ISelection; // merge cell, start and end is upper left cell
}

export interface ISelection extends IPosition, IRangeData {}

export interface ITextSelectionRangeStart {
    cursorStart: number;
    isStartBack: boolean;
}

export interface ITextSelectionRange extends ITextSelectionRangeStart {
    cursorEnd: number;
    isEndBack: boolean;
    isCollapse: boolean;
}

export interface ITextSelectionRangeParam extends ITextSelectionRange {
    segmentId?: string; //The ID of the header, footer or footnote the location is in. An empty segment ID signifies the document's body.
}

export interface ITextSelectionRangeStartParam extends ITextSelectionRangeStart {
    segmentId?: string;
}
