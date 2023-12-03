import type { Nullable } from '../../shared/types';
import type { IRange } from './i-range';

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

export interface ITextRangeStart {
    startOffset: number;
}

export interface ITextRange extends ITextRangeStart {
    endOffset: number;
    collapsed: boolean;
}

export interface ITextRangeParam extends ITextRange {
    segmentId?: string; //The ID of the header, footer or footnote the location is in. An empty segment ID signifies the document's body.
}
