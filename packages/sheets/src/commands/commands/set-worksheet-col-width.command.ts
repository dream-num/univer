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
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    RANGE_TYPE,
    Rectangle,
    sequenceExecute,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import { SelectionManagerService } from '../../services/selection-manager.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import type { ISetWorksheetColWidthMutationParams } from '../mutations/set-worksheet-col-width.mutation';
import {
    SetWorksheetColWidthMutation,
    SetWorksheetColWidthMutationFactory,
} from '../mutations/set-worksheet-col-width.mutation';

export interface IDeltaColumnWidthCommandParams {
    anchorCol: number;
    deltaX: number;
}

export const DeltaColumnWidthCommand: ICommand<IDeltaColumnWidthCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.delta-column-width',
    handler: async (accessor: IAccessor, params: IDeltaColumnWidthCommandParams) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelections();

        if (!selections?.length) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();

        const { anchorCol, deltaX } = params;
        const anchorColWidth = worksheet.getColumnWidth(anchorCol);
        const destColumnWidth = anchorColWidth + deltaX;

        const colSelections = selections.filter((s) => s.range.rangeType === RANGE_TYPE.COLUMN);
        const rangeType = colSelections.some(({ range }) => {
            const { startColumn, endColumn } = range;

            return startColumn <= anchorCol && anchorCol <= endColumn;
        })
            ? RANGE_TYPE.COLUMN
            : RANGE_TYPE.NORMAL;

        let redoMutationParams: ISetWorksheetColWidthMutationParams;
        if (rangeType === RANGE_TYPE.COLUMN) {
            redoMutationParams = {
                worksheetId,
                workbookId,
                ranges: colSelections.map((s) => Rectangle.clone(s.range)),
                colWidth: destColumnWidth,
            };
        } else {
            redoMutationParams = {
                worksheetId,
                workbookId,
                colWidth: destColumnWidth,
                ranges: [
                    {
                        startRow: 0,
                        endRow: worksheet.getMaxRows() - 1,
                        startColumn: anchorCol,
                        endColumn: anchorCol,
                    },
                ],
            };
        }

        const undoMutationParams: ISetWorksheetColWidthMutationParams = SetWorksheetColWidthMutationFactory(
            accessor,
            redoMutationParams
        );

        const setColWidthResult = commandService.syncExecuteCommand(
            SetWorksheetColWidthMutation.id,
            redoMutationParams
        );

        const { undos, redos } = accessor.get(SheetInterceptorService).onCommandExecute({
            id: DeltaColumnWidthCommand.id,
            params: redoMutationParams,
        });

        const result = sequenceExecute([...redos], commandService);

        if (setColWidthResult && result.result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: [{ id: SetWorksheetColWidthMutation.id, params: undoMutationParams }, ...undos],
                redoMutations: [{ id: SetWorksheetColWidthMutation.id, params: redoMutationParams }, ...redos],
            });

            return true;
        }

        return true;
    },
};

export interface ISetColWidthCommandParams {
    value: number;
}

export const SetColWidthCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-col-width',
    handler: async (accessor: IAccessor, params: ISetColWidthCommandParams) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const selections = selectionManagerService.getSelectionRanges();
        if (!selections?.length) {
            return false;
        }

        const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();

        const redoMutationParams: ISetWorksheetColWidthMutationParams = {
            worksheetId,
            workbookId,
            ranges: selections,
            colWidth: params.value,
        };
        const undoMutationParams: ISetWorksheetColWidthMutationParams = SetWorksheetColWidthMutationFactory(
            accessor,
            redoMutationParams
        );
        const setColWidthResult = commandService.syncExecuteCommand(
            SetWorksheetColWidthMutation.id,
            redoMutationParams
        );

        const { undos, redos } = accessor.get(SheetInterceptorService).onCommandExecute({
            id: SetColWidthCommand.id,
            params: redoMutationParams,
        });

        const result = sequenceExecute([...redos], commandService);

        if (setColWidthResult && result.result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: [{ id: SetWorksheetColWidthMutation.id, params: undoMutationParams }, ...undos],
                redoMutations: [{ id: SetWorksheetColWidthMutation.id, params: redoMutationParams }, ...redos],
            });

            return true;
        }

        return false;
    },
};
