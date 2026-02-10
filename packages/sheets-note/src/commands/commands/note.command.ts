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

import type { ICommand, IMutationInfo } from '@univerjs/core';
import type { IRemoveNoteMutationParams, IToggleNotePopupMutationParams, IUpdateNoteMutationParams } from '../mutations/note.mutation';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { getSheetCommandTarget, SheetsSelectionsService } from '@univerjs/sheets';
import { SheetsNoteModel } from '../../models/sheets-note.model';
import { RemoveNoteMutation, ToggleNotePopupMutation, UpdateNoteMutation } from '../mutations/note.mutation';

export const SheetDeleteNoteCommand: ICommand = {
    id: 'sheet.command.delete-note',
    type: CommandType.COMMAND,
    handler: (accessor) => {
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;

        const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
        const selection = sheetsSelectionsService.getCurrentLastSelection();
        if (!selection?.primary) return false;

        const sheetsNoteModel = accessor.get(SheetsNoteModel);
        const { unitId, subUnitId } = target;
        const { actualColumn, actualRow } = selection.primary;
        const note = sheetsNoteModel.getNote(unitId, subUnitId, { row: actualRow, col: actualColumn });
        if (!note) return false;

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const redoMutation: IMutationInfo<IRemoveNoteMutationParams> = {
            id: RemoveNoteMutation.id,
            params: {
                unitId,
                sheetId: subUnitId,
                noteId: note.id,
            },
        };
        const undoMutation: IMutationInfo<IUpdateNoteMutationParams> = {
            id: UpdateNoteMutation.id,
            params: {
                unitId,
                sheetId: subUnitId,
                row: actualRow,
                col: actualColumn,
                note: { ...note },
            },
        };

        const result = commandService.syncExecuteCommand(redoMutation.id, redoMutation.params);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations: [redoMutation],
                undoMutations: [undoMutation],
            });
            return true;
        }

        return false;
    },
};

export const SheetToggleNotePopupCommand: ICommand = {
    id: 'sheet.command.toggle-note-popup',
    type: CommandType.COMMAND,
    handler: (accessor) => {
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;

        const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
        const selection = sheetsSelectionsService.getCurrentLastSelection();
        if (!selection?.primary) return false;

        const sheetsNoteModel = accessor.get(SheetsNoteModel);
        const { unitId, subUnitId } = target;
        const { actualColumn, actualRow } = selection.primary;
        const note = sheetsNoteModel.getNote(unitId, subUnitId, { row: actualRow, col: actualColumn });
        if (!note) return false;

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const redoMutation: IMutationInfo<IToggleNotePopupMutationParams> = {
            id: ToggleNotePopupMutation.id,
            params: {
                unitId,
                sheetId: subUnitId,
                noteId: note.id,
            },
        };
        const undoMutation: IMutationInfo<IToggleNotePopupMutationParams> = {
            id: ToggleNotePopupMutation.id,
            params: {
                unitId,
                sheetId: subUnitId,
                noteId: note.id,
            },
        };

        const result = commandService.syncExecuteCommand(redoMutation.id, redoMutation.params);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations: [redoMutation],
                undoMutations: [undoMutation],
            });
            return true;
        }

        return false;
    },
};

export const SheetUpdateNoteCommand: ICommand<IUpdateNoteMutationParams> = {
    id: 'sheet.command.update-note',
    type: CommandType.COMMAND,
    handler: (accessor, params: IUpdateNoteMutationParams) => {
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), params);
        if (!target) return false;

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetsNoteModel = accessor.get(SheetsNoteModel);

        const { unitId, subUnitId } = target;
        const { row, col, note } = params;
        const oldNote = sheetsNoteModel.getNote(unitId, subUnitId, { noteId: note.id, row, col });

        const redoMutation: IMutationInfo<IUpdateNoteMutationParams> = {
            id: UpdateNoteMutation.id,
            params: {
                unitId,
                sheetId: subUnitId,
                row,
                col,
                note,
            },
        };
        const undoMutations: IMutationInfo[] = [];

        if (oldNote) {
            const undoMutation: IMutationInfo<IUpdateNoteMutationParams> = {
                id: UpdateNoteMutation.id,
                params: {
                    unitId,
                    sheetId: subUnitId,
                    row,
                    col,
                    note: { ...oldNote },
                },
            };
            undoMutations.push(undoMutation);
        } else {
            const undoMutation: IMutationInfo<IRemoveNoteMutationParams> = {
                id: RemoveNoteMutation.id,
                params: {
                    unitId,
                    sheetId: subUnitId,
                    row,
                    col,
                },
            };
            undoMutations.push(undoMutation);
        }

        const result = commandService.syncExecuteCommand(redoMutation.id, redoMutation.params);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations: [redoMutation],
                undoMutations,
            });
            return true;
        }

        return false;
    },
};
