import { ISelectionData, ISelectionRange, Nullable } from '@univerjs/core';

/**
 * Whether to display the controller that modifies the selection, distributed in 8 locations
 * tl top_left_corner
 * tc top_center_corner
 * tr top_right_corner
 * ml middle_left_corner
 * mr middle_right_corner
 * bl bottom_left_corner
 * bc bottom_center_corner
 * br bottom_right_corner
 */
export interface ISelectionControlConfig {
    tl?: boolean;
    tc?: boolean;
    tr?: boolean;
    ml?: boolean;
    mr?: boolean;
    bl?: boolean;
    bc?: boolean;
    br?: boolean;
}

export interface ISelectionStyle {
    strokeDashArray: number[];
    strokeWidth: number;
    stroke: string;
    fill: string;
    controls: ISelectionControlConfig;
    hasAutoFill: boolean;
}

export interface ISelectionDataWithStyle extends ISelectionData {
    style: Nullable<ISelectionStyle>;
}

export interface ISelectionRangeWithStyle extends ISelectionRange {
    style: Nullable<ISelectionStyle>;
}

export const NORMAL_SELECTION_PLUGIN_STYLE = {
    strokeDashArray: [],
    strokeWidth: 2,
    stroke: 'rgb(1,136,251)',
    fill: 'rgba(0, 0, 0, 0.2)',
    controls: {},
    hasAutoFill: true,
};

export function convertSelectionDataToRange(selectionDataWithStyle: ISelectionDataWithStyle): ISelectionRangeWithStyle {
    const { selection, cellInfo, style } = selectionDataWithStyle;
    const result: ISelectionRangeWithStyle = {
        rangeData: {
            startRow: selection.startRow,
            startColumn: selection.startColumn,
            endRow: selection.endRow,
            endColumn: selection.endColumn,
        },
        cellRange: null,
        style,
    };
    if (cellInfo != null) {
        const { row, column, isMerged, isMergedMainCell } = cellInfo;
        const { startRow, startColumn, endRow, endColumn } = cellInfo.mergeInfo;
        result.cellRange = {
            row,
            column,
            isMerged,
            isMergedMainCell,
            startRow,
            startColumn,
            endRow,
            endColumn,
        };
    }
    return result;
}
