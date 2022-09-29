import { Range } from '../Sheets/Domain';
import { IRangeData, IRangeType } from './IRangeData';

/**
 * Properties of selection data
 */
export interface ISelectionData {
    selection?: IRangeType | IRangeType[] | Range;
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
