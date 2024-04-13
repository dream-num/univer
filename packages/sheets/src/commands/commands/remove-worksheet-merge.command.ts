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

import type { ICommand } from '@univerjs/core';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, Rectangle, sequenceExecute, Tools } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type {
    IAddWorksheetMergeMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../../basics/interfaces/mutation-interface';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { AddWorksheetMergeMutation } from '../mutations/add-worksheet-merge.mutation';
import {
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
} from '../mutations/remove-worksheet-merge.mutation';
import { SetSelectionsOperation } from '../../commands/operations/selection.operation';
import { getSheetCommandTarget } from './utils/target-util';

export const RemoveWorksheetMergeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-worksheet-merge',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const selections = selectionManagerService.getSelectionRanges();
        if (!selections?.length) return false;

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { subUnitId, unitId, worksheet } = target;
        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: selections,
        };

        // 范围内没有合并单元格return
        let hasMerge = false;
        const mergeData = worksheet.getConfig().mergeData;
        selections.forEach((selection) => {
            mergeData.forEach((merge) => {
                if (Rectangle.intersects(selection, merge)) {
                    hasMerge = true;
                }
            });
        });
        if (!hasMerge) return false;

        const undoredoMutationParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            accessor,
            removeMergeMutationParams
        );

        const nowSelections = selectionManagerService.getSelections();
        if (!nowSelections?.length) return false;

        const undoSelections = Tools.deepClone(nowSelections);
        const redoSelections = Tools.deepClone(nowSelections);
        const redoLastSelection = redoSelections[redoSelections.length - 1];
        const { startRow, startColumn } = redoLastSelection.range;
        redoLastSelection.primary = {
            startRow,
            startColumn,
            endRow: startRow,
            endColumn: startColumn,
            actualRow: startRow,
            actualColumn: startColumn,
            isMerged: false,
            isMergedMainCell: false,
        };

        const result = sequenceExecute([
            { id: RemoveWorksheetMergeMutation.id, params: undoredoMutationParams },
            { id: SetSelectionsOperation.id, params: { selections: redoSelections } },

        ], commandService);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: AddWorksheetMergeMutation.id, params: undoredoMutationParams }, { id: SetSelectionsOperation.id, params: { selections: undoSelections } }],
                // params should be the merged cells to be deleted accurately, rather than the selection
                redoMutations: [{ id: RemoveWorksheetMergeMutation.id, params: undoredoMutationParams }, { id: SetSelectionsOperation.id, params: { selections: redoSelections } }],
            });
            return true;
        }
        return false;
    },
};
