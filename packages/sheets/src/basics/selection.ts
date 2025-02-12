/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {
    ICellWithCoord,
    IRange,
    IRangeWithCoord,
    ISelection,
    ISelectionCell,
    Nullable,
} from '@univerjs/core';
import { getCellInfoInMergeData, makeCellRangeToRangeData } from '@univerjs/core';

export const SELECTION_CONTROL_BORDER_BUFFER_WIDTH = 1.5; // The draggable range of the selection is too thin, making it easy for users to miss. Therefore, a buffer gap is provided to make it easier for users to select.

export const SELECTION_CONTROL_BORDER_BUFFER_COLOR = 'rgba(255, 255, 255, 0.01)';

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

/**
 * https://support.microsoft.com/en-us/office/select-cell-contents-in-excel-23f64223-2b6b-453a-8688-248355f10fa9
 */
export interface ISelectionStyle {
    /**
     * Assign an ID to a selection area.
     * The current scenario is to identify the formula string corresponding to the selection area
     */
    id?: string;
    /**
     * The volume of the selection border determines the thickness of the selection border
     */
    strokeWidth: number;
    /**
     * The color of the selection border.
     */
    stroke: string;
    /**
     * The dashed line of the selection border. Here, the dashed line is a numerical value, different from the canvas dashed line setting. It is implemented internally as [0, strokeDash]. Setting it to 8 will look more aesthetically pleasing.
     */
    strokeDash?: number;

    /**
     * Enable 'marching ants' animation
     */
    isAnimationDash?: boolean;

    /**
     * The fill color inside the selection. It needs to have a level of transparency, otherwise content in the covered area of the selection will be obscured.
     */
    fill: string;
    /**
     * The eight touch points of the selection. You can refer to Excel's formula and chart selections,
     * which allow you to manually adjust the size of the selection.
     *  Univer has four more touch points (up, down, left, and right) than Excel.
     *  https://support.microsoft.com/en-us/office/select-data-for-a-chart-5fca57b7-8c52-4e09-979a-631085113862
     */
    widgets: ISelectionWidgetConfig;
    /**
     * The volume of the touch points.
     */
    widgetSize: number;
    /**
     * The thickness of the border of the touch points
     */
    widgetStrokeWidth?: number;
    /**
     *  The color of the touch points.
     */
    widgetStroke?: string;

    /**
     * https://support.microsoft.com/en-us/office/copy-a-formula-by-dragging-the-fill-handle-in-excel-for-mac-dd928259-622b-473f-9a33-83aa1a63e218
     * Whether to show the drop-down fill button at the bottom right corner of the selection.
     */
    // hasAutoFill?: boolean;
    autofillSize?: number; // The size of the fill button.
    autofillStrokeWidth?: number; // The border size of the fill button.
    autofillStroke?: string; // The color of the fill button.

    /**
     * The color of the row title highlight.
     * A level of transparency should be set to avoid covering the row title content.
     */
    rowHeaderFill?: string;
    /**
     * The color of the bottom border of the row title.
     */
    rowHeaderStroke?: string;
    /**
     * The color of the bottom border of the row title.
     */
    rowHeaderStrokeWidth?: number;

    columnHeaderFill?: string;
    columnHeaderStroke?: string;
    columnHeaderStrokeWidth?: number;

    expandCornerSize?: number;
}

/**
 * Selection range Info, contains selection range & primary range
 * primary range is the range of the highlighted cell.
 *
 * rangeWithCoord: IRangeWithCoord;
 * primaryWithCoord: Nullable<ICellWithCoord>;
 * style?
 */
export interface ISelectionWithCoord {
    rangeWithCoord: IRangeWithCoord;
    primaryWithCoord: Nullable<ICellWithCoord>;
    style?: Nullable<ISelectionStyle>;
}

/**
 * range: IRange;
 * primary: Nullable<ISelectionCell>;
 * style: Nullable<ISelectionStyle>;
 */
export interface ISelectionWithStyle extends ISelection {
    range: IRange;
    /**
     * if primary is null, means clear primary cell.
     * if primary is not defined, means not keep current primary cell.
     */
    primary: Nullable<ISelectionCell>;
    style?: Nullable<Partial<ISelectionStyle>>;
}

export interface ISheetRangeLocation {
    range: IRange;
    subUnitId: string;
    unitId: string;
}

/**
 * Process a selection with coordinates and style,
 * and extract the coordinate information, because the render needs coordinates when drawing.
 * Since the selection.manager.service is unrelated to the coordinates,
 * it only accepts data of type ISelectionWithStyle, so a conversion is necessary.
 * @param selectionWithCoordAndStyle Selection with coordinates and style
 * @returns
 */
export function convertSelectionDataToRange(
    selectionWithCoordAndStyle: ISelectionWithCoord
): ISelectionWithStyle {
    const { rangeWithCoord, primaryWithCoord, style } = selectionWithCoordAndStyle;
    const result: ISelectionWithStyle = {
        range: {
            startRow: rangeWithCoord.startRow,
            startColumn: rangeWithCoord.startColumn,
            endRow: rangeWithCoord.endRow,
            endColumn: rangeWithCoord.endColumn,
            rangeType: rangeWithCoord.rangeType,
            unitId: rangeWithCoord.unitId,
            sheetId: rangeWithCoord.sheetId,
        },
        primary: null,
        style,
    };
    if (primaryWithCoord != null) {
        result.primary = convertPrimaryWithCoordToPrimary(primaryWithCoord);
    }
    return result;
}

export function convertPrimaryWithCoordToPrimary(primaryWithCoord: ICellWithCoord) {
    const { actualRow, actualColumn, isMerged, isMergedMainCell } = primaryWithCoord;
    const { startRow, startColumn, endRow, endColumn } = primaryWithCoord.mergeInfo;
    return {
        actualRow,
        actualColumn,
        isMerged,
        isMergedMainCell,
        startRow,
        startColumn,
        endRow,
        endColumn,
    };
}

/**
 * @deprecated Use worksheet.getCellInfoInMergeData or SpreadsheetSkeleton.getCellByIndex instead
 * Convert the coordinates of a single cell into a selection data.
 * @param row Specified Row Coordinate
 * @param column Specified Column Coordinate
 * @param mergeData  Obtain the data of merged cells through the worksheet object.
 * @returns ISelectionWithStyle
 */
export function transformCellDataToSelectionData(
    row: number,
    column: number,
    mergeData: IRange[]
): Nullable<ISelectionWithStyle> {
    const newCellRange = getCellInfoInMergeData(row, column, mergeData);

    const newSelectionData = makeCellRangeToRangeData(newCellRange);

    if (!newSelectionData) {
        return;
    }

    return {
        range: newSelectionData,
        primary: newCellRange,
        style: null,
    };
}
