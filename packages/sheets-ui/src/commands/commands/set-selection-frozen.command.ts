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
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, RANGE_TYPE } from '@univerjs/core';
import type { ISetFrozenMutationParams } from '@univerjs/sheets';
import { SelectionManagerService, SetFrozenMutation, SetFrozenMutationFactory } from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';

import { ScrollManagerService } from '../../services/scroll-manager.service';

// TODO @zw this command was duplicate with set-frozen.command.ts, should delete it
export const SetSelectionFrozenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-selection-frozen',
    handler: async (accessor: IAccessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelections();
        if (!selections) {
            return false;
        }
        const currentSelection = selections[selections?.length - 1];
        const { range } = currentSelection;
        const scrollManagerService = accessor.get(ScrollManagerService);
        const { sheetViewStartRow = 0, sheetViewStartColumn = 0 } = scrollManagerService.getCurrentScroll() || {};
        let startRow;
        let startColumn;
        let ySplit;
        let xSplit;
        const { startRow: selectRow, startColumn: selectColumn, rangeType } = range;
        // Frozen to Row
        if (rangeType === RANGE_TYPE.ROW) {
            startRow = selectRow;
            ySplit = selectRow - sheetViewStartRow;
            startColumn = -1;
            xSplit = 0;
            // Frozen to Column
        } else if (rangeType === RANGE_TYPE.COLUMN) {
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
            workbookId,
            worksheetId,
            startRow,
            startColumn,
            xSplit,
            ySplit,
        };
        const undoMutationParams: ISetFrozenMutationParams = SetFrozenMutationFactory(accessor, redoMutationParams);

        const result = commandService.syncExecuteCommand(SetFrozenMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: [{ id: SetFrozenMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetFrozenMutation.id, params: redoMutationParams }],
            });
            return true;
        }
        return true;
    },
};
