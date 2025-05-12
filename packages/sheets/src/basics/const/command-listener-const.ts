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

import type { ICommandInfo, IRange } from '@univerjs/core';
import type { IMoveRangeMutationParams } from '../../commands/mutations/move-range.mutation';
import type { IMoveColumnsMutationParams, IMoveRowsMutationParams } from '../../commands/mutations/move-rows-cols.mutation';
import type { IReorderRangeMutationParams } from '../../commands/mutations/reorder-range.mutation';
import type { ISetColDataMutationParams } from '../../commands/mutations/set-col-data.mutation';
import type { ISetColHiddenMutationParams, ISetColVisibleMutationParams } from '../../commands/mutations/set-col-visible.mutation';
import type { ISetGridlinesColorMutationParams } from '../../commands/mutations/set-gridlines-color.mutation';
import type { ISetRangeValuesMutationParams } from '../../commands/mutations/set-range-values.mutation';
import type { ISetRowDataMutationParams } from '../../commands/mutations/set-row-data.mutation';
import type { ISetRowHiddenMutationParams, ISetRowVisibleMutationParams } from '../../commands/mutations/set-row-visible.mutation';
import type { ISetWorksheetColWidthMutationParams } from '../../commands/mutations/set-worksheet-col-width.mutation';
import type { ISetWorksheetDefaultStyleMutationParams } from '../../commands/mutations/set-worksheet-default-style.mutation';
import type {
    ISetWorksheetRowAutoHeightMutationParams,
    ISetWorksheetRowHeightMutationParams,
    ISetWorksheetRowIsAutoHeightMutationParams,
} from '../../commands/mutations/set-worksheet-row-height.mutation';
import type { IToggleGridlinesMutationParams } from '../../commands/mutations/toggle-gridlines.mutation';
import type { ISetWorksheetActiveOperationParams } from '../../commands/operations/set-worksheet-active.operation';
import type { IAddWorksheetMergeMutationParams, IInsertColMutationParams, IInsertRowMutationParams, IRemoveColMutationParams, IRemoveRowsMutationParams, IRemoveWorksheetMergeMutationParams, IWorksheetRangeThemeStyleMutationParams } from '../interfaces';
import { ObjectMatrix, RANGE_TYPE } from '@univerjs/core';
import { AddWorksheetMergeMutation } from '../../commands/mutations/add-worksheet-merge.mutation';
import { SetWorksheetRangeThemeStyleMutation } from '../../commands/mutations/add-worksheet-range-theme.mutation';
import { DeleteWorksheetRangeThemeStyleMutation } from '../../commands/mutations/delete-worksheet-range-theme.mutation';
import { InsertColMutation, InsertRowMutation } from '../../commands/mutations/insert-row-col.mutation';
import { MoveRangeMutation } from '../../commands/mutations/move-range.mutation';
import { MoveColsMutation, MoveRowsMutation } from '../../commands/mutations/move-rows-cols.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../../commands/mutations/remove-row-col.mutation';
import { RemoveWorksheetMergeMutation } from '../../commands/mutations/remove-worksheet-merge.mutation';
import { ReorderRangeMutation } from '../../commands/mutations/reorder-range.mutation';
import { SetColDataMutation } from '../../commands/mutations/set-col-data.mutation';

import { SetColHiddenMutation, SetColVisibleMutation } from '../../commands/mutations/set-col-visible.mutation';
import { SetGridlinesColorMutation } from '../../commands/mutations/set-gridlines-color.mutation';
import { SetRangeValuesMutation } from '../../commands/mutations/set-range-values.mutation';
import { SetRowDataMutation } from '../../commands/mutations/set-row-data.mutation';
import { SetRowHiddenMutation, SetRowVisibleMutation } from '../../commands/mutations/set-row-visible.mutation';
import { SetWorksheetColWidthMutation } from '../../commands/mutations/set-worksheet-col-width.mutation';
import { SetWorksheetColumnCountMutation } from '../../commands/mutations/set-worksheet-column-count.mutation';
import { SetWorksheetDefaultStyleMutation } from '../../commands/mutations/set-worksheet-default-style.mutation';
import { SetWorksheetRowCountMutation } from '../../commands/mutations/set-worksheet-row-count.mutation';
import {
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowHeightMutation,
    SetWorksheetRowIsAutoHeightMutation,
} from '../../commands/mutations/set-worksheet-row-height.mutation';
import { ToggleGridlinesMutation } from '../../commands/mutations/toggle-gridlines.mutation';
import { SetWorksheetActiveOperation } from '../../commands/operations/set-worksheet-active.operation';

/**
 * Enum for all skeleton change command IDs
 */
export enum SheetSkeletonChangeType {
    SET_WORKSHEET_ROW_HEIGHT = 'sheet.mutation.set-worksheet-row-height',
    SET_WORKSHEET_ROW_IS_AUTO_HEIGHT = 'sheet.mutation.set-worksheet-row-is-auto-height',
    SET_WORKSHEET_ROW_AUTO_HEIGHT = 'sheet.mutation.set-worksheet-row-auto-height',
    SET_WORKSHEET_COL_WIDTH = 'sheet.mutation.set-worksheet-col-width',
    SET_WORKSHEET_ACTIVE = 'sheet.operation.set-worksheet-active',
    MOVE_ROWS = 'sheet.mutation.move-rows',
    MOVE_COLUMNS = 'sheet.mutation.move-columns',
    SET_COL_HIDDEN = 'sheet.mutation.set-col-hidden',
    SET_COL_VISIBLE = 'sheet.mutation.set-col-visible',
    SET_ROW_HIDDEN = 'sheet.mutation.set-row-hidden',
    SET_ROW_VISIBLE = 'sheet.mutation.set-row-visible',
    INSERT_COL = 'sheet.mutation.insert-col',
    INSERT_ROW = 'sheet.mutation.insert-row',
    REMOVE_COL = 'sheet.mutation.remove-col',
    REMOVE_ROW = 'sheet.mutation.remove-rows',
    TOGGLE_GRIDLINES = 'sheet.mutation.toggle-gridlines',
    SET_GRIDLINES_COLOR = 'sheet.mutation.set-gridlines-color',
}

/**
 * Enum for all value change command IDs
 */
export enum SheetValueChangeType {
    SET_RANGE_VALUES = 'sheet.mutation.set-range-values',
    MOVE_RANGE = 'sheet.mutation.move-range',
    REMOVE_WORKSHEET_MERGE = 'sheet.mutation.remove-worksheet-merge',
    ADD_WORKSHEET_MERGE = 'sheet.mutation.add-worksheet-merge',
    REORDER_RANGE = 'sheet.mutation.reorder-range',
    SET_WORKSHEET_DEFAULT_STYLE = 'sheet.mutation.set-worksheet-default-style',
    SET_ROW_DATA = 'sheet.mutation.set-row-data',
    SET_COL_DATA = 'sheet.mutation.set-col-data',
    SET_WORKSHEET_RANGE_THEME_STYLE = 'sheet.mutation.set-worksheet-range-theme-style',
    DELETE_WORKSHEET_RANGE_THEME_STYLE = 'sheet.mutation.delete-worksheet-range-theme-style',
}

/**
 * Mutations those will trigger the skeleton change.
 */
export const COMMAND_LISTENER_SKELETON_CHANGE = [
    SetWorksheetRowHeightMutation.id,
    SetWorksheetRowIsAutoHeightMutation.id,
    SetWorksheetRowAutoHeightMutation.id,
    SetWorksheetColWidthMutation.id,
    SetWorksheetActiveOperation.id,
    MoveRowsMutation.id,
    MoveColsMutation.id,
    SetColHiddenMutation.id,
    SetColVisibleMutation.id,
    SetRowHiddenMutation.id,
    SetRowVisibleMutation.id,
    InsertColMutation.id,
    InsertRowMutation.id,
    RemoveColMutation.id,
    RemoveRowMutation.id,
    ToggleGridlinesMutation.id,
    SetGridlinesColorMutation.id,
    SetWorksheetRowCountMutation.id,
    SetWorksheetColumnCountMutation.id,
];

export const COMMAND_LISTENER_VALUE_CHANGE = [
    SetRangeValuesMutation.id,
    MoveRangeMutation.id,
    RemoveWorksheetMergeMutation.id,
    AddWorksheetMergeMutation.id,
    ReorderRangeMutation.id,
    SetWorksheetDefaultStyleMutation.id,
    SetRowDataMutation.id,
    SetColDataMutation.id,
    SetWorksheetRangeThemeStyleMutation.id,
    DeleteWorksheetRangeThemeStyleMutation.id,
];

export type CommandListenerSkeletonChange =
    | {
        id: SheetSkeletonChangeType.SET_WORKSHEET_ROW_HEIGHT;
        params: ISetWorksheetRowHeightMutationParams;
    }
    | {
        id: SheetSkeletonChangeType.SET_WORKSHEET_ROW_IS_AUTO_HEIGHT;
        params: ISetWorksheetRowIsAutoHeightMutationParams;
    }
    | {
        id: SheetSkeletonChangeType.SET_WORKSHEET_ROW_AUTO_HEIGHT;
        params: ISetWorksheetRowAutoHeightMutationParams;
    }
    | {
        id: SheetSkeletonChangeType.SET_WORKSHEET_COL_WIDTH;
        params: ISetWorksheetColWidthMutationParams;
    }
    | {
        id: SheetSkeletonChangeType.SET_WORKSHEET_ACTIVE;
        params: ISetWorksheetActiveOperationParams;
    }
    | {
        id: SheetSkeletonChangeType.MOVE_ROWS;
        params: IMoveRowsMutationParams;
    }
    | {
        id: SheetSkeletonChangeType.MOVE_COLUMNS;
        params: IMoveColumnsMutationParams;
    }
    | {
        id: SheetSkeletonChangeType.SET_COL_HIDDEN;
        params: ISetColHiddenMutationParams;
    }
    | {
        id: SheetSkeletonChangeType.SET_COL_VISIBLE;
        params: ISetColVisibleMutationParams;
    }
    | {
        id: SheetSkeletonChangeType.SET_ROW_HIDDEN;
        params: ISetRowHiddenMutationParams;
    }
    | {
        id: SheetSkeletonChangeType.SET_ROW_VISIBLE;
        params: ISetRowVisibleMutationParams;
    }
    | {
        id: SheetSkeletonChangeType.INSERT_COL;
        params: IInsertColMutationParams;
    }
    | {
        id: SheetSkeletonChangeType.INSERT_ROW;
        params: IInsertRowMutationParams;
    }
    | {
        id: SheetSkeletonChangeType.REMOVE_COL;
        params: IRemoveColMutationParams;
    }
    | {
        id: SheetSkeletonChangeType.REMOVE_ROW;
        params: IRemoveRowsMutationParams;
    }
    | {
        id: SheetSkeletonChangeType.TOGGLE_GRIDLINES;
        params: IToggleGridlinesMutationParams;
    }
    | {
        id: SheetSkeletonChangeType.SET_GRIDLINES_COLOR;
        params: ISetGridlinesColorMutationParams;
    };

export type CommandListenerValueChange =
    | {
        id: SheetValueChangeType.SET_RANGE_VALUES;
        params: ISetRangeValuesMutationParams;
    }
    | {
        id: SheetValueChangeType.MOVE_RANGE;
        params: IMoveRangeMutationParams;
    }
    | {
        id: SheetValueChangeType.REMOVE_WORKSHEET_MERGE;
        params: IRemoveWorksheetMergeMutationParams;
    }
    | {
        id: SheetValueChangeType.ADD_WORKSHEET_MERGE;
        params: IAddWorksheetMergeMutationParams;
    }
    | {
        id: SheetValueChangeType.REORDER_RANGE;
        params: IReorderRangeMutationParams;
    }
    | {
        id: SheetValueChangeType.SET_WORKSHEET_DEFAULT_STYLE;
        params: ISetWorksheetDefaultStyleMutationParams;
    }
    | {
        id: SheetValueChangeType.SET_ROW_DATA;
        params: ISetRowDataMutationParams;
    }
    | {
        id: SheetValueChangeType.SET_COL_DATA;
        params: ISetColDataMutationParams;
    }
    | {
        id: SheetValueChangeType.SET_WORKSHEET_RANGE_THEME_STYLE;
        params: IWorksheetRangeThemeStyleMutationParams;
    }
    | {
        id: SheetValueChangeType.DELETE_WORKSHEET_RANGE_THEME_STYLE;
        params: IWorksheetRangeThemeStyleMutationParams;
    };

// eslint-disable-next-line max-lines-per-function
export function getValueChangedEffectedRange(commandInfo: ICommandInfo): { unitId: string; subUnitId: string; range: IRange }[] {
    switch (commandInfo.id) {
        case SheetValueChangeType.SET_RANGE_VALUES: {
            const params = commandInfo.params as ISetRangeValuesMutationParams;
            const range = new ObjectMatrix(params.cellValue).getDataRange();
            if (range.endRow === -1) return [];
            return params.cellValue
                ? [{
                    unitId: params.unitId,
                    subUnitId: params.subUnitId,
                    range,
                }]
                : [];
        }

        case SheetValueChangeType.MOVE_RANGE: {
            const params = commandInfo.params as IMoveRangeMutationParams;
            return [{
                unitId: params.unitId,
                subUnitId: params.from.subUnitId,
                range: new ObjectMatrix(params.from.value).getRange(),
            }, {
                unitId: params.unitId,
                subUnitId: params.to.subUnitId,
                range: new ObjectMatrix(params.to.value).getRange(),
            }];
        }

        case SheetValueChangeType.REMOVE_WORKSHEET_MERGE: {
            const params = commandInfo.params as IRemoveWorksheetMergeMutationParams;
            return params.ranges.map((range) => ({
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range,
            }));
        }

        case SheetValueChangeType.ADD_WORKSHEET_MERGE: {
            const params = commandInfo.params as IAddWorksheetMergeMutationParams;
            return params.ranges.map((range) => ({
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range,
            }));
        }

        case SheetValueChangeType.REORDER_RANGE: {
            const params = commandInfo.params as IReorderRangeMutationParams;
            return [{
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range: params.range,
            }];
        }

        case SheetValueChangeType.SET_WORKSHEET_DEFAULT_STYLE: {
            const params = commandInfo.params as ISetWorksheetDefaultStyleMutationParams;
            return [{
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range: { startRow: 0, endRow: Number.MAX_SAFE_INTEGER, startColumn: 0, endColumn: Number.MAX_SAFE_INTEGER },
            }];
        }

        case SheetValueChangeType.SET_ROW_DATA: {
            const params = commandInfo.params as ISetRowDataMutationParams;
            const rowIndices = Object.keys(params.rowData).map(Number);
            if (rowIndices.length === 0) return [];
            return [{
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range: {
                    startRow: Math.min(...rowIndices),
                    endRow: Math.max(...rowIndices),
                    startColumn: 0,
                    endColumn: Number.MAX_SAFE_INTEGER,
                },
            }];
        }

        case SheetValueChangeType.SET_COL_DATA: {
            const params = commandInfo.params as ISetColDataMutationParams;
            const colIndices = Object.keys(params.columnData).map(Number);
            if (colIndices.length === 0) return [];
            return [{
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range: {
                    startRow: 0,
                    endRow: Number.MAX_SAFE_INTEGER,
                    startColumn: Math.min(...colIndices),
                    endColumn: Math.max(...colIndices),
                },
            }];
        }

        case SheetValueChangeType.SET_WORKSHEET_RANGE_THEME_STYLE:
        case SheetValueChangeType.DELETE_WORKSHEET_RANGE_THEME_STYLE: {
            const params = commandInfo.params as IWorksheetRangeThemeStyleMutationParams;
            return [{
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range: params.range,
            }];
        }

        default:
            return [];
    }
}

/**
 * Get the affected range for skeleton change commands
 * @param {ICommandInfo} commandInfo The command information
 * @returns {{ unitId: string; subUnitId: string; range: IRange }[]} Array of affected ranges
 */
// eslint-disable-next-line max-lines-per-function
export function getSkeletonChangedEffectedRange(commandInfo: ICommandInfo, columnCount: number): { unitId: string; subUnitId: string; range: IRange }[] {
    switch (commandInfo.id) {
        case SheetSkeletonChangeType.SET_WORKSHEET_ROW_HEIGHT:
        case SheetSkeletonChangeType.SET_WORKSHEET_ROW_IS_AUTO_HEIGHT: {
            const params = commandInfo.params as ISetWorksheetRowHeightMutationParams;
            return params.ranges.map((range) => ({
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range: {
                    ...range,
                    rangeType: RANGE_TYPE.ROW,
                },
            }));
        }
        // Note: SET_WORKSHEET_ROW_AUTO_HEIGHT has no ranges
        case SheetSkeletonChangeType.SET_WORKSHEET_ROW_AUTO_HEIGHT:{
            const params = commandInfo.params as ISetWorksheetRowAutoHeightMutationParams;
            return params.rowsAutoHeightInfo.map((rowAutoHeightInfo) => ({
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range: {
                    startRow: rowAutoHeightInfo.row,
                    endRow: rowAutoHeightInfo.row,
                    startColumn: 0,
                    endColumn: columnCount - 1,
                    rangeType: RANGE_TYPE.ROW,
                },
            }));
        }

        case SheetSkeletonChangeType.SET_WORKSHEET_COL_WIDTH: {
            const params = commandInfo.params as ISetWorksheetColWidthMutationParams;
            return params.ranges.map((range) => ({
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range: {
                    ...range,
                    rangeType: RANGE_TYPE.COLUMN,
                },
            }));
        }

        case SheetSkeletonChangeType.MOVE_ROWS:
        case SheetSkeletonChangeType.MOVE_COLUMNS: {
            const params = commandInfo.params as IMoveRowsMutationParams;
            return [{
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range: params.targetRange,
            }, {
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range: params.sourceRange,
            }];
        }

        case SheetSkeletonChangeType.SET_COL_HIDDEN:
        case SheetSkeletonChangeType.SET_COL_VISIBLE: {
            const params = commandInfo.params as ISetColVisibleMutationParams;
            return params.ranges.map((range) => ({
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range: {
                    ...range,
                    rangeType: RANGE_TYPE.COLUMN,
                },
            }));
        }

        case SheetSkeletonChangeType.SET_ROW_HIDDEN:
        case SheetSkeletonChangeType.SET_ROW_VISIBLE: {
            const params = commandInfo.params as ISetRowVisibleMutationParams;
            return params.ranges.map((range) => ({
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range: {
                    ...range,
                    rangeType: RANGE_TYPE.ROW,
                },
            }));
        }

        case SheetSkeletonChangeType.INSERT_COL: {
            const params = commandInfo.params as IInsertColMutationParams;
            return [{
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range: {
                    ...params.range,
                    rangeType: RANGE_TYPE.COLUMN,
                },
            }];
        }

        case SheetSkeletonChangeType.INSERT_ROW: {
            const params = commandInfo.params as IInsertRowMutationParams;
            return [{
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range: {
                    ...params.range,
                    rangeType: RANGE_TYPE.ROW,
                },
            }];
        }

        case SheetSkeletonChangeType.REMOVE_COL: {
            const params = commandInfo.params as IRemoveColMutationParams;
            return [{
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range: {
                    ...params.range,
                    rangeType: RANGE_TYPE.COLUMN,
                },
            }];
        }

        case SheetSkeletonChangeType.REMOVE_ROW: {
            const params = commandInfo.params as IRemoveRowsMutationParams;
            return [{
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range: {
                    ...params.range,
                    rangeType: RANGE_TYPE.ROW,
                },
            }];
        }

        case SheetSkeletonChangeType.TOGGLE_GRIDLINES:
        case SheetSkeletonChangeType.SET_GRIDLINES_COLOR: {
            return [];
        }

        default:
            return [];
    }
}
