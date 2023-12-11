/**
 * Copyright 2023 DreamNum Inc.
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
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, Rectangle } from '@univerjs/core';
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
        const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = univerInstanceService
            .getCurrentUniverSheetInstance()

            .getActiveSheet()
            .getSheetId();

        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
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

        const undoMutationParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            accessor,
            removeMergeMutationParams
        );
        const result = commandService.syncExecuteCommand(RemoveWorksheetMergeMutation.id, removeMergeMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: [{ id: AddWorksheetMergeMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams }],
            });
            return true;
        }
        return false;
    },
};
