import { Nullable } from '../../Shared/Types';
import { IRange } from './IRange';

/**
 * Properties of selection data
 */
export interface IPosition {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

export interface ISingleCell {
    actualRow: number;
    actualColumn: number;
    isMerged: boolean;
    isMergedMainCell: boolean;
}

export interface IRangeWithCoord extends IPosition, IRange {}

export interface ISelectionCell extends IRange, ISingleCell {}

export interface ISelectionCellWithCoord extends IPosition, ISingleCell {
    mergeInfo: IRangeWithCoord; // merge cell, start and end is upper left cell
}

export interface ISelection {
    range: IRange;
    primary: Nullable<ISelectionCell>;
}

export interface ISelectionWithCoord {
    rangeWithCoord: IRangeWithCoord;
    primaryWithCoord: Nullable<ISelectionCellWithCoord>;
}

export interface ITextSelectionRangeStart {
    cursorStart: number;
}

export interface ITextSelectionRange extends ITextSelectionRangeStart {
    cursorEnd: number;
    isCollapse: boolean;
}

export interface ITextSelectionRangeParam extends ITextSelectionRange {
    segmentId?: string; //The ID of the header, footer or footnote the location is in. An empty segment ID signifies the document's body.
}

export interface ITextSelectionRangeStartParam extends ITextSelectionRangeStart {
    segmentId?: string;
}
