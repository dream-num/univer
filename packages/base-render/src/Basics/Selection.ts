import { ISelection, ISelectionWithCoord, Nullable } from '@univerjs/core';

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
export interface ISelectionWidgetConfig {
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
    strokeWidth: number;
    stroke: string;
    fill: string;
    widgets: ISelectionWidgetConfig;
    widgetSize?: number;
    widgetStrokeWidth?: number;
    widgetStroke?: string;

    hasAutoFill: boolean;
    AutofillSize?: number;
    AutofillStrokeWidth?: number;
    AutofillStroke?: string;

    hasRowTitle?: boolean;
    rowTitleFill?: string;
    rowTitleStroke?: string;
    rowTitleStrokeWidth?: number;

    hasColumnTitle?: boolean;
    columnTitleFill?: string;
    columnTitleStroke?: string;
    columnTitleStrokeWidth?: number;
}

export interface ISelectionDataWithStyle extends ISelectionWithCoord {
    style: Nullable<ISelectionStyle>;
}

export interface ISelectionRangeWithStyle extends ISelection {
    style: Nullable<ISelectionStyle>;
}

export const NORMAL_SELECTION_PLUGIN_STYLE: ISelectionStyle = {
    strokeWidth: 2,
    stroke: 'rgb(1,136,251)',
    fill: 'rgba(0, 0, 0, 0.1)',
    // widgets: { tl: true, tc: true, tr: true, ml: true, mr: true, bl: true, bc: true, br: true },
    widgets: {},
    widgetSize: 6,
    widgetStrokeWidth: 1,
    widgetStroke: 'rgb(255,255,255)',

    hasAutoFill: true,
    AutofillSize: 6,
    AutofillStrokeWidth: 1,
    AutofillStroke: 'rgb(255,255,255)',

    hasRowTitle: true,
    rowTitleFill: 'rgba(0, 0, 0, 0.1)',
    rowTitleStroke: 'rgb(1,136,251)',
    rowTitleStrokeWidth: 1,

    hasColumnTitle: true,
    columnTitleFill: 'rgba(0, 0, 0, 0.1)',
    columnTitleStroke: 'rgb(1,136,251)',
    columnTitleStrokeWidth: 1,
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

export const SELECTION_CONTROL_BORDER_BUFFER_WIDTH = 4;

export const SELECTION_CONTROL_BORDER_BUFFER_COLOR = 'rgba(255,255,255, 0.01)';
