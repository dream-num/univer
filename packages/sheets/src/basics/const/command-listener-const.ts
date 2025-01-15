/**
 * Copyright 2023-present DreamNum Inc.
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
    ISetWorksheetRowIsAutoHeightMutationParams } from '../../commands/mutations/set-worksheet-row-height.mutation';
import type { IToggleGridlinesMutationParams } from '../../commands/mutations/toggle-gridlines.mutation';
import type { ISetWorksheetActiveOperationParams } from '../../commands/operations/set-worksheet-active.operation';
import type { IAddWorksheetMergeMutationParams, IInsertColMutationParams, IInsertRowMutationParams, IRemoveColMutationParams, IRemoveRowsMutationParams, IRemoveWorksheetMergeMutationParams, IWorksheetRangeThemeStyleMutationParams } from '../interfaces';
import { type ICommandInfo, type IRange, ObjectMatrix, RANGE_TYPE } from '@univerjs/core';
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
import { SetWorksheetDefaultStyleMutation } from '../../commands/mutations/set-worksheet-default-style.mutation';
import {
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowHeightMutation,
    SetWorksheetRowIsAutoHeightMutation,
} from '../../commands/mutations/set-worksheet-row-height.mutation';
import { ToggleGridlinesMutation } from '../../commands/mutations/toggle-gridlines.mutation';
import { SetWorksheetActiveOperation } from '../../commands/operations/set-worksheet-active.operation';

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
];

export type CommandListenerSkeletonChange =
    | {
        id: 'sheet.mutation.set-worksheet-row-height';
        params: ISetWorksheetRowHeightMutationParams;
    }
    | {
        id: 'sheet.mutation.set-worksheet-row-is-auto-height';
        params: ISetWorksheetRowIsAutoHeightMutationParams;
    }
    | {
        id: 'sheet.mutation.set-worksheet-row-auto-height';
        params: ISetWorksheetRowAutoHeightMutationParams;
    }
    | {
        id: 'sheet.mutation.set-worksheet-col-width';
        params: ISetWorksheetColWidthMutationParams;
    }
    | {
        id: 'sheet.operation.set-worksheet-active';
        params: ISetWorksheetActiveOperationParams;
    }
    | {
        id: 'sheet.mutation.move-rows';
        params: IMoveRowsMutationParams;
    }
    | {
        id: 'sheet.mutation.move-columns';
        params: IMoveColumnsMutationParams;
    }
    | {
        id: 'sheet.mutation.set-col-hidden';
        params: ISetColHiddenMutationParams;
    }
    | {
        id: 'sheet.mutation.set-col-visible';
        params: ISetColVisibleMutationParams;
    }
    | {
        id: 'sheet.mutation.set-row-hidden';
        params: ISetRowHiddenMutationParams;
    }
    | {
        id: 'sheet.mutation.set-row-visible';
        params: ISetRowVisibleMutationParams;
    }
    | {
        id: 'sheet.mutation.insert-col';
        params: IInsertColMutationParams;
    }
    | {
        id: 'sheet.mutation.insert-row';
        params: IInsertRowMutationParams;
    }
    | {
        id: 'sheet.mutation.remove-col';
        params: IRemoveColMutationParams;
    }
    | {
        id: 'sheet.mutation.remove-row';
        params: IRemoveRowsMutationParams;
    }
    | {
        id: 'sheet.mutation.toggle-gridlines';
        params: IToggleGridlinesMutationParams;
    }
    | {
        id: 'sheet.mutation.set-gridlines-color';
        params: ISetGridlinesColorMutationParams;
    };

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

export type CommandListenerValueChange =
    | {
        id: 'sheet.mutation.set-range-values';
        params: ISetRangeValuesMutationParams;
    }
    | {
        id: 'sheet.mutation.move-range';
        params: IMoveRangeMutationParams;
    }
    | {
        id: 'sheet.mutation.remove-worksheet-merge';
        params: IRemoveWorksheetMergeMutationParams;
    }
    | {
        id: 'sheet.mutation.add-worksheet-merge';
        params: IAddWorksheetMergeMutationParams;
    }
    | {
        id: 'sheet.mutation.reorder-range';
        params: IReorderRangeMutationParams;
    }
    | {
        id: 'sheet.mutation.set-worksheet-default-style';
        params: ISetWorksheetDefaultStyleMutationParams;
    }
    | {
        id: 'sheet.mutation.set-row-data';
        params: ISetRowDataMutationParams;
    }
    | {
        id: 'sheet.mutation.set-col-data';
        params: ISetColDataMutationParams;
    }
    | {
        id: 'sheet.mutation.set-worksheet-range-theme-style';
        params: IWorksheetRangeThemeStyleMutationParams;
    }
    | {
        id: 'sheet.mutation.delete-worksheet-range-theme-style';
        params: IWorksheetRangeThemeStyleMutationParams;
    };

// eslint-disable-next-line max-lines-per-function
export function getValueChangedEffectedRange(commandInfo: ICommandInfo): { unitId: string;subUnitId: string; range: IRange }[] {
    switch (commandInfo.id) {
        case SetRangeValuesMutation.id: {
            const params = commandInfo.params as ISetRangeValuesMutationParams;
            return params.cellValue
                ? [{
                    unitId: params.unitId,
                    subUnitId: params.subUnitId,
                    range: new ObjectMatrix(params.cellValue).getDataRange(),
                }]
                : [];
        }

        case MoveRangeMutation.id: {
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

        case RemoveWorksheetMergeMutation.id: {
            const params = commandInfo.params as IRemoveWorksheetMergeMutationParams;
            return params.ranges.map((range) => ({
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range,
            }));
        }

        case AddWorksheetMergeMutation.id: {
            const params = commandInfo.params as IAddWorksheetMergeMutationParams;
            return params.ranges.map((range) => ({
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range,
            }));
        }

        case ReorderRangeMutation.id: {
            const params = commandInfo.params as IReorderRangeMutationParams;
            return [{
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range: params.range,
            }];
        }

        case SetWorksheetDefaultStyleMutation.id: {
            const params = commandInfo.params as ISetWorksheetDefaultStyleMutationParams;
            return [{
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range: { startRow: 0, endRow: Number.MAX_SAFE_INTEGER, startColumn: 0, endColumn: Number.MAX_SAFE_INTEGER },
            }];
        }

        case SetRowDataMutation.id: {
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

        case SetColDataMutation.id: {
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

        case SetWorksheetRangeThemeStyleMutation.id: {
            const params = commandInfo.params as IWorksheetRangeThemeStyleMutationParams;
            return [{
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                range: params.range,
            }];
        }

        case DeleteWorksheetRangeThemeStyleMutation.id: {
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
export function getSkeletonChangedEffectedRange(commandInfo: ICommandInfo): { unitId: string; subUnitId: string; range: IRange }[] {
    switch (commandInfo.id) {
        case SetWorksheetRowHeightMutation.id:
        case SetWorksheetRowIsAutoHeightMutation.id:
        case SetWorksheetRowAutoHeightMutation.id: {
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

        case SetWorksheetColWidthMutation.id: {
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

        case MoveColsMutation.id:
        case MoveRowsMutation.id: {
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

        case SetColHiddenMutation.id:
        case SetColVisibleMutation.id: {
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

        case SetRowHiddenMutation.id:
        case SetRowVisibleMutation.id: {
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

        case InsertColMutation.id: {
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

        case InsertRowMutation.id: {
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

        case RemoveColMutation.id: {
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

        case RemoveRowMutation.id: {
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

        case ToggleGridlinesMutation.id:
        case SetGridlinesColorMutation.id: {
            return [];
        }

        default:
            return [];
    }
}
