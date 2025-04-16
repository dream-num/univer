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

import type { IAccessor, ICommand, IRange } from '@univerjs/core';
import type { ISetWorksheetColWidthMutationParams } from '../mutations/set-worksheet-col-width.mutation';

import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    RANGE_TYPE,
    Rectangle,
    sequenceExecute,
} from '@univerjs/core';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import {
    SetWorksheetColWidthMutation,
    SetWorksheetColWidthMutationFactory,
} from '../mutations/set-worksheet-col-width.mutation';
import { getSheetCommandTarget } from './utils/target-util';

export interface IDeltaColumnWidthCommandParams {
    anchorCol: number;
    deltaX: number;
}

export const DeltaColumnWidthCommand: ICommand<IDeltaColumnWidthCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.delta-column-width',
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params: IDeltaColumnWidthCommandParams) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections();

        if (!selections?.length) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;

        const { worksheet, unitId, subUnitId } = target;

        const { anchorCol, deltaX } = params;
        const anchorColWidth = worksheet.getColumnWidth(anchorCol);
        const destColumnWidth = anchorColWidth + deltaX;

        const isAllSheetRange = selections.length === 1 && selections[0].range.rangeType === RANGE_TYPE.ALL;
        const colSelections = selections.filter((s) => s.range.rangeType === RANGE_TYPE.COLUMN);
        const rangeType = isAllSheetRange
            ? RANGE_TYPE.ALL
            : colSelections.some(({ range }) => {
                const { startColumn, endColumn } = range;
                return startColumn <= anchorCol && anchorCol <= endColumn;
            })
                ? RANGE_TYPE.COLUMN
                : RANGE_TYPE.NORMAL;

        let redoMutationParams: ISetWorksheetColWidthMutationParams;
        if (rangeType === RANGE_TYPE.ALL) {
            const rowCount = worksheet.getRowCount();
            const allColRanges = new Array(worksheet.getColumnCount())
                .fill(undefined)
                .map(
                    (_, index) =>
                        ({ startRow: 0, endRow: rowCount - 1, startColumn: index, endColumn: index }) as IRange
                );

            redoMutationParams = {
                subUnitId,
                unitId,
                colWidth: destColumnWidth,
                ranges: allColRanges,
            };
        } else if (rangeType === RANGE_TYPE.COLUMN) {
            redoMutationParams = {
                subUnitId,
                unitId,
                ranges: colSelections.map((s) => Rectangle.clone(s.range)),
                colWidth: destColumnWidth,
            };
        } else {
            redoMutationParams = {
                subUnitId,
                unitId,
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

        const { undos, redos } = accessor.get(SheetInterceptorService).onCommandExecute({
            id: DeltaColumnWidthCommand.id,
            params: redoMutationParams,
        });

        const undoMutationParams: ISetWorksheetColWidthMutationParams = SetWorksheetColWidthMutationFactory(
            redoMutationParams,
            worksheet
        );

        const setColWidthResult = commandService.syncExecuteCommand(
            SetWorksheetColWidthMutation.id,
            redoMutationParams
        );

        const result = sequenceExecute([...redos], commandService);

        if (setColWidthResult && result.result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetWorksheetColWidthMutation.id, params: undoMutationParams }, ...undos],
                redoMutations: [{ id: SetWorksheetColWidthMutation.id, params: redoMutationParams }, ...redos],
            });

            return true;
        }

        return true;
    },
};

export interface ISetColWidthCommandParams {
    unitId?: string;
    subUnitId?: string;
    ranges?: IRange[];
    value: number;
}

export const SetColWidthCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-col-width',
    handler: (accessor: IAccessor, params: ISetColWidthCommandParams) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        // user can specify the ranges to set col width, if not, use current selections
        const selections = params?.ranges?.length ? params.ranges : selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        if (!selections?.length) return false;

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), params);
        if (!target) return false;

        const { subUnitId, unitId, worksheet } = target;
        const redoMutationParams: ISetWorksheetColWidthMutationParams = {
            subUnitId,
            unitId,
            ranges: selections,
            colWidth: params.value,
        };

        const undoMutationParams = SetWorksheetColWidthMutationFactory(redoMutationParams, worksheet);
        const setColWidthResult = commandService.syncExecuteCommand(SetWorksheetColWidthMutation.id, redoMutationParams);

        const { undos, redos } = accessor.get(SheetInterceptorService).onCommandExecute({
            id: SetColWidthCommand.id,
            params: redoMutationParams,
        });

        const intercepted = sheetInterceptorService.onCommandExecute({
            id: SetColWidthCommand.id,
            params: redoMutationParams,
        });

        const result = sequenceExecute([...redos, ...intercepted.redos], commandService);

        if (setColWidthResult && result.result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [...(intercepted.preUndos ?? []), { id: SetWorksheetColWidthMutation.id, params: undoMutationParams }, ...undos],
                redoMutations: [...(intercepted.preRedos ?? []), { id: SetWorksheetColWidthMutation.id, params: redoMutationParams }, ...redos],
            });

            return true;
        }

        return false;
    },
};

export interface ISetWorksheetColIsAutoWidthCommandParams {
    unitId?: string;
    subUnitId?: string;
    ranges?: IRange[]; // For Facade API
}

export const SetWorksheetColIsAutoWidthCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-col-is-auto-width',
    handler: async (accessor: IAccessor, params?: ISetWorksheetColIsAutoWidthCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { unitId, subUnitId } = target;

        let ranges = [];
        if (params?.ranges) {
            ranges = [...params.ranges];
        } else {
            const selections = selectionManagerService.getCurrentSelections();
            for (let i = 0; i < selections.length; i++) {
                ranges.push(selections[i].range);
            }
        }

        if (!ranges?.length) {
            return false;
        }

        const redoMutationParams: Required<ISetWorksheetColIsAutoWidthCommandParams> = {
            unitId,
            subUnitId,
            ranges,
        };

        // undos redos comes from auto-width.controller
        // for intercept 'sheet.command.set-col-is-auto-width' command.
        const { undos, redos } = accessor.get(SheetInterceptorService).onCommandExecute({
            id: SetWorksheetColIsAutoWidthCommand.id,
            params: redoMutationParams,
        });

        const result = sequenceExecute([...redos], commandService);
        if (result.result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [...undos],
                redoMutations: [...redos],
            });

            return true;
        }

        return false;
    },
};
