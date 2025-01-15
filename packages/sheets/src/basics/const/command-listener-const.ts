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

import type { IMoveColumnsMutationParams, IMoveRowsMutationParams } from '../../commands/mutations/move-rows-cols.mutation';
import type { ISetColHiddenMutationParams, ISetColVisibleMutationParams } from '../../commands/mutations/set-col-visible.mutation';
import type { ISetGridlinesColorMutationParams } from '../../commands/mutations/set-gridlines-color.mutation';
import type { ISetRowHiddenMutationParams, ISetRowVisibleMutationParams } from '../../commands/mutations/set-row-visible.mutation';
import type { ISetWorksheetColWidthMutationParams } from '../../commands/mutations/set-worksheet-col-width.mutation';
import type {
    ISetWorksheetRowAutoHeightMutationParams,
    ISetWorksheetRowHeightMutationParams,
    ISetWorksheetRowIsAutoHeightMutationParams } from '../../commands/mutations/set-worksheet-row-height.mutation';
import type { IToggleGridlinesMutationParams } from '../../commands/mutations/toggle-gridlines.mutation';
import type { ISetWorksheetActiveOperationParams } from '../../commands/operations/set-worksheet-active.operation';
import type { IInsertColMutationParams, IInsertRowMutationParams, IRemoveColMutationParams, IRemoveRowsMutationParams } from '../interfaces';
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
        id: 'sheet.mutation.move-cols';
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
