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

import { AddWorksheetMergeMutation } from '../../commands/mutations/add-worksheet-merge.mutation';
import { InsertColMutation, InsertRowMutation } from '../../commands/mutations/insert-row-col.mutation';
import { MoveRangeMutation } from '../../commands/mutations/move-range.mutation';
import { MoveColsMutation, MoveRowsMutation } from '../../commands/mutations/move-rows-cols.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../../commands/mutations/remove-row-col.mutation';
import { RemoveWorksheetMergeMutation } from '../../commands/mutations/remove-worksheet-merge.mutation';
import { SetColHiddenMutation, SetColVisibleMutation } from '../../commands/mutations/set-col-visible.mutation';
import { SetRangeValuesMutation } from '../../commands/mutations/set-range-values.mutation';
import { SetRowHiddenMutation, SetRowVisibleMutation } from '../../commands/mutations/set-row-visible.mutation';
import { SetWorksheetColWidthMutation } from '../../commands/mutations/set-worksheet-col-width.mutation';
import {
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowHeightMutation,
    SetWorksheetRowIsAutoHeightMutation,
} from '../../commands/mutations/set-worksheet-row-height.mutation';
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
];

export const COMMAND_LISTENER_VALUE_CHANGE = [
    SetRangeValuesMutation.id,
    MoveRangeMutation.id,
    RemoveWorksheetMergeMutation.id,
    AddWorksheetMergeMutation.id,
];
