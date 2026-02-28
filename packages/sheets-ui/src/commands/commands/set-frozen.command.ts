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

import type { ICommand } from '@univerjs/core';
import type { ISetFrozenMutationParams } from '@univerjs/sheets';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, RANGE_TYPE } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { getSheetCommandTarget, SetFrozenMutation, SetFrozenMutationFactory, SheetsSelectionsService } from '@univerjs/sheets';
import { SheetScrollManagerService } from '../../services/scroll-manager.service';

export enum SetSelectionFrozenType {
    RowColumn = 0,
    Row = 1,
    Column = 2,
    FirstRow = 3,
    FirstColumn = 4,
}

export interface ISetSelectionFrozenCommandParams {
    type?: SetSelectionFrozenType;
}

export const SetSelectionFrozenCommand: ICommand<ISetSelectionFrozenCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-selection-frozen',
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor, params) => {
        const { type } = params || {};
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { unitId, subUnitId } = target;
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections();
        if (!selections) {
            return false;
        }

        const renderManagerSrv = accessor.get(IRenderManagerService);
        const scrollManagerService = renderManagerSrv.getRenderById(unitId)!.with(SheetScrollManagerService);
        const { sheetViewStartRow = 0, sheetViewStartColumn = 0 } = scrollManagerService.getCurrentScrollState() || {};

        let startRow;
        let startColumn;
        let freezedRowCount;
        let freezedColCount;

        if (type === SetSelectionFrozenType.FirstRow) {
            startRow = sheetViewStartRow + 1; ;
            freezedRowCount = 1;
            startColumn = -1;
            freezedColCount = 0;
        } else if (type === SetSelectionFrozenType.FirstColumn) {
            startRow = -1;
            freezedRowCount = 0;
            startColumn = sheetViewStartColumn + 1;
            freezedColCount = 1;
        } else {
            const currentSelection = selections[selections?.length - 1];
            const { primary, range } = currentSelection;
            let selectRow = primary?.startRow ?? range.startRow;
            if (selectRow === 0) {
                selectRow = 1;
            }
            let selectColumn = primary?.startColumn ?? range.startColumn;
            if (selectColumn === 0) {
                selectColumn = 1;
            }
            const rangeType = range.rangeType;

            if (rangeType === RANGE_TYPE.ROW || type === SetSelectionFrozenType.Row) {
                // Frozen to Row
                startRow = selectRow;
                freezedRowCount = selectRow - sheetViewStartRow;
                startColumn = -1;
                freezedColCount = 0;
            } else if (rangeType === RANGE_TYPE.COLUMN || type === SetSelectionFrozenType.Column) {
                // Frozen to Column
                startRow = -1;
                freezedRowCount = 0;
                startColumn = selectColumn;
                freezedColCount = selectColumn - sheetViewStartColumn;
            } else if (rangeType === RANGE_TYPE.NORMAL) {
                // Frozen to Range
                startRow = selectRow;
                freezedRowCount = selectRow - sheetViewStartRow;
                startColumn = selectColumn;
                freezedColCount = selectColumn - sheetViewStartColumn;
            } else {
                // Unexpected value
                return false;
            }
        }

        const redoMutationParams: ISetFrozenMutationParams = {
            unitId,
            subUnitId,
            startRow,
            startColumn,
            xSplit: startColumn > 0 ? Math.max(1, freezedColCount) : freezedColCount,
            ySplit: startRow > 0 ? Math.max(1, freezedRowCount) : freezedRowCount,
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

export const SetFirstRowFrozenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-first-row-frozen',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        commandService.executeCommand(SetSelectionFrozenCommand.id, {
            type: SetSelectionFrozenType.FirstRow,
        });

        return true;
    },
};

export const SetFirstColumnFrozenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-first-column-frozen',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        commandService.executeCommand(SetSelectionFrozenCommand.id, {
            type: SetSelectionFrozenType.FirstColumn,
        });

        return true;
    },
};
