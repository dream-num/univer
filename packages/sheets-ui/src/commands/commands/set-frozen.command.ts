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
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, RANGE_TYPE } from '@univerjs/core';
import type { ISetFrozenMutationParams } from '@univerjs/sheets';
import { getSheetCommandTarget, SelectionManagerService, SetFrozenMutation, SetFrozenMutationFactory } from '@univerjs/sheets';

import { SheetScrollManagerService } from '../../services/scroll-manager.service';

export enum SetSelectionFrozenType {
    RowColumn = 0,
    Row = 1,
    Column = 2,
}

export interface ISetSelectionFrozenCommandParams {
    type?: SetSelectionFrozenType;
}

export const SetSelectionFrozenCommand: ICommand<ISetSelectionFrozenCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-selection-frozen',
    handler: async (accessor, params) => {
        const { type } = params || {};
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { unitId, subUnitId } = target;
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelections();
        if (!selections) {
            return false;
        }
        const currentSelection = selections[selections?.length - 1];
        const { range } = currentSelection;
        const scrollManagerService = accessor.get(SheetScrollManagerService);
        const { sheetViewStartRow = 0, sheetViewStartColumn = 0 } = scrollManagerService.getCurrentScrollInfo() || {};
        let startRow;
        let startColumn;
        let ySplit;
        let xSplit;
        const { startRow: selectRow, startColumn: selectColumn, rangeType } = range;
        // Frozen to Row
        if (rangeType === RANGE_TYPE.ROW || type === SetSelectionFrozenType.Row) {
            startRow = selectRow;
            ySplit = selectRow - sheetViewStartRow;
            startColumn = -1;
            xSplit = 0;
            // Frozen to Column
        } else if (rangeType === RANGE_TYPE.COLUMN || type === SetSelectionFrozenType.Column) {
            startRow = -1;
            ySplit = 0;
            startColumn = selectColumn;
            xSplit = selectColumn - sheetViewStartColumn;
            // Frozen to Range
        } else if (rangeType === RANGE_TYPE.NORMAL) {
            startRow = selectRow;
            ySplit = selectRow - sheetViewStartRow;
            startColumn = selectColumn;
            xSplit = selectColumn - sheetViewStartColumn;
            // Unexpected value
        } else {
            return false;
        }
        const redoMutationParams: ISetFrozenMutationParams = {
            unitId,
            subUnitId,
            startRow,
            startColumn,
            xSplit: startColumn > 0 ? Math.max(1, xSplit) : xSplit,
            ySplit: startRow > 0 ? Math.max(1, ySplit) : ySplit,
        };
        const undoMutationParams: ISetFrozenMutationParams = SetFrozenMutationFactory(accessor, redoMutationParams);

        const result = commandService.syncExecuteCommand(SetFrozenMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetFrozenMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetFrozenMutation.id, params: redoMutationParams }],
            });
            return true;
        }
        return true;
    },
};

export const SetRowFrozenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-row-frozen',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        commandService.executeCommand(SetSelectionFrozenCommand.id, {
            type: SetSelectionFrozenType.Row,
        });

        return true;
    },
};

export const SetColumnFrozenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-col-frozen',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        commandService.executeCommand(SetSelectionFrozenCommand.id, {
            type: SetSelectionFrozenType.Column,
        });

        return true;
    },
};

export const CancelFrozenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.cancel-frozen',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { unitId, subUnitId } = target;

        const redoMutationParams: ISetFrozenMutationParams = {
            unitId,
            subUnitId,
            startRow: -1,
            startColumn: -1,
            xSplit: 0,
            ySplit: 0,
        };
        const undoMutationParams: ISetFrozenMutationParams = SetFrozenMutationFactory(accessor, redoMutationParams);

        const result = commandService.syncExecuteCommand(SetFrozenMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetFrozenMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetFrozenMutation.id, params: redoMutationParams }],
            });
            return true;
        }
        return true;
    },
};
