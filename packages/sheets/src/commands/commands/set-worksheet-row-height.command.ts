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
import type {
    ISetWorksheetRowHeightMutationParams,
    ISetWorksheetRowIsAutoHeightMutationParams,
} from '../mutations/set-worksheet-row-height.mutation';

import {
    BooleanNumber,
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
    SetWorksheetRowHeightMutation,
    SetWorksheetRowHeightMutationFactory,
    SetWorksheetRowIsAutoHeightMutation,
    SetWorksheetRowIsAutoHeightMutationFactory,
} from '../mutations/set-worksheet-row-height.mutation';
import { getSheetCommandTarget } from './utils/target-util';

export interface IDeltaRowHeightCommand {
    anchorRow: number;
    deltaY: number;
}

export const DeltaRowHeightCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.delta-row-height',
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params: IDeltaRowHeightCommand) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections();
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        if (!selections?.length) {
            return false;
        }

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;

        const { worksheet, subUnitId, unitId } = target;

        const { anchorRow, deltaY } = params;
        const anchorRowHeight = worksheet.getRowHeight(anchorRow);
        const destRowHeight = anchorRowHeight + deltaY;

        const isAllSheetRange = selections.length === 1 && selections[0].range.rangeType === RANGE_TYPE.ALL;
        const rowSelections = selections.filter((s) => s.range.rangeType === RANGE_TYPE.ROW);
        const rangeType = isAllSheetRange
            ? RANGE_TYPE.ALL
            : rowSelections.some(({ range }) => {
                const { startRow, endRow } = range;
                return startRow <= anchorRow && anchorRow <= endRow;
            })
                ? RANGE_TYPE.ROW
                : RANGE_TYPE.NORMAL;

        let redoMutationParams: ISetWorksheetRowHeightMutationParams;
        if (rangeType === RANGE_TYPE.ALL) {
            const colCount = worksheet.getColumnCount();
            const allRowRanges = new Array(worksheet.getRowCount())
                .fill(undefined)
                .map(
                    (_, index) =>
                        ({ startRow: index, endRow: index, startColumn: 0, endColumn: colCount - 1 }) as IRange
                );

            redoMutationParams = {
                subUnitId,
                unitId,
                rowHeight: destRowHeight,
                ranges: allRowRanges,
            };
        } else if (rangeType === RANGE_TYPE.ROW) {
            redoMutationParams = {
                subUnitId,
                unitId,
                ranges: rowSelections.map((s) => Rectangle.clone(s.range)),
                rowHeight: destRowHeight,
            };
        } else {
            redoMutationParams = {
                subUnitId,
                unitId,
                rowHeight: destRowHeight,
                ranges: [
                    {
                        startRow: anchorRow,
                        endRow: anchorRow,
                        startColumn: 0,
                        endColumn: worksheet.getMaxColumns() - 1,
                    },
                ],
            };
        }

        const undoMutationParams: ISetWorksheetRowHeightMutationParams = SetWorksheetRowHeightMutationFactory(redoMutationParams, worksheet);

        const redoSetIsAutoHeightParams: ISetWorksheetRowIsAutoHeightMutationParams = {
            unitId,
            subUnitId,
            ranges: redoMutationParams.ranges,
            autoHeightInfo: BooleanNumber.FALSE,
        };

        const undoSetIsAutoHeightParams: ISetWorksheetRowIsAutoHeightMutationParams =
            SetWorksheetRowIsAutoHeightMutationFactory(redoSetIsAutoHeightParams, worksheet);

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const intercepted = sheetInterceptorService.onCommandExecute({
            id: DeltaRowHeightCommand.id,
            params: redoMutationParams,
        });

        const result = sequenceExecute([
            {
                id: SetWorksheetRowHeightMutation.id,
                params: redoMutationParams,
            },
            {
                id: SetWorksheetRowIsAutoHeightMutation.id,
                params: redoSetIsAutoHeightParams,
            },
        ], commandService);

        const interceptedResult = sequenceExecute([...intercepted.redos], commandService);

        if (result.result && interceptedResult.result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    ...(intercepted.preUndos ?? []),
                    {
                        id: SetWorksheetRowHeightMutation.id,
                        params: undoMutationParams,
                    },
                    {
                        id: SetWorksheetRowIsAutoHeightMutation.id,
                        params: undoSetIsAutoHeightParams,
                    },
                    ...intercepted.undos,
                ],
                redoMutations: [
                    ...(intercepted.preRedos ?? []),
                    {
                        id: SetWorksheetRowHeightMutation.id,
                        params: redoMutationParams,
                    },
                    {
                        id: SetWorksheetRowIsAutoHeightMutation.id,
                        params: redoSetIsAutoHeightParams,
                    },
                    ...intercepted.redos,
                ],
            });
            return true;
        }

        return false;
    },
};

export interface ISetRowHeightCommandParams {
    unitId?: string;
    subUnitId?: string;
    ranges?: IRange[]; // For Facade API
    value: number;
}

export const SetRowHeightCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-row-height',
    // eslint-disable-next-line max-lines-per-function
    handler: (accessor: IAccessor, params: ISetRowHeightCommandParams) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        // user can specify the ranges to set row height, if not, use the current selection
        const selections = params?.ranges?.length ? params.ranges : selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        if (!selections?.length) {
            return false;
        }

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { unitId, subUnitId, worksheet } = target;

        const redoMutationParams: ISetWorksheetRowHeightMutationParams = {
            subUnitId,
            unitId,
            ranges: selections,
            rowHeight: params.value,
        };

        const undoMutationParams: ISetWorksheetRowHeightMutationParams = SetWorksheetRowHeightMutationFactory(redoMutationParams, worksheet);

        const redoSetIsAutoHeightParams: ISetWorksheetRowIsAutoHeightMutationParams = {
            unitId,
            subUnitId,
            ranges: redoMutationParams.ranges,
            autoHeightInfo: BooleanNumber.FALSE,
        };

        const undoSetIsAutoHeightParams: ISetWorksheetRowIsAutoHeightMutationParams =
            SetWorksheetRowIsAutoHeightMutationFactory(redoSetIsAutoHeightParams, worksheet);

        const result = sequenceExecute([
            {
                id: SetWorksheetRowHeightMutation.id,
                params: redoMutationParams,
            },
            {
                id: SetWorksheetRowIsAutoHeightMutation.id,
                params: redoSetIsAutoHeightParams,
            },
        ], commandService);

        const intercepted = sheetInterceptorService.onCommandExecute({
            id: SetRowHeightCommand.id,
            params: redoMutationParams,
        });

        const sheetInterceptorResult = sequenceExecute([...intercepted.redos], commandService);

        if (result.result && sheetInterceptorResult.result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    ...intercepted.preRedos ?? [],
                    {
                        id: SetWorksheetRowHeightMutation.id,
                        params: undoMutationParams,
                    },
                    {
                        id: SetWorksheetRowIsAutoHeightMutation.id,
                        params: undoSetIsAutoHeightParams,
                    },
                    ...intercepted.undos,
                ],
                redoMutations: [
                    ...intercepted.preRedos ?? [],
                    {
                        id: SetWorksheetRowHeightMutation.id,
                        params: redoMutationParams,
                    },
                    {
                        id: SetWorksheetRowIsAutoHeightMutation.id,
                        params: redoSetIsAutoHeightParams,
                    },
                    ...intercepted.redos,
                ],
            });
            return true;
        }

        return false;
    },
};

export interface ISetWorksheetRowIsAutoHeightCommandParams {
    unitId?: string;
    subUnitId?: string;
    ranges?: IRange[]; // For Facade API
}

export const SetWorksheetRowIsAutoHeightCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-row-is-auto-height',
    handler: (accessor: IAccessor, params?: ISetWorksheetRowIsAutoHeightCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { unitId, subUnitId, worksheet } = target;
        const ranges = params?.ranges?.length ? params.ranges : selectionManagerService.getCurrentSelections()?.map((s) => s.range);

        if (!ranges?.length) {
            return false;
        }

        const redoMutationParams: ISetWorksheetRowIsAutoHeightMutationParams = {
            unitId,
            subUnitId,
            ranges,
            autoHeightInfo: BooleanNumber.TRUE, // Hard code first, maybe it will change by the menu item in the future.
        };

        const undoMutationParams: ISetWorksheetRowIsAutoHeightMutationParams =
            SetWorksheetRowIsAutoHeightMutationFactory(redoMutationParams, worksheet);

        const setIsAutoHeightResult = commandService.syncExecuteCommand(
            SetWorksheetRowIsAutoHeightMutation.id,
            redoMutationParams
        );

        const { undos, redos } = accessor.get(SheetInterceptorService).onCommandExecute({
            id: SetWorksheetRowIsAutoHeightCommand.id,
            params: redoMutationParams,
        });

        const result = sequenceExecute([...redos], commandService);
        if (setIsAutoHeightResult && result.result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetWorksheetRowIsAutoHeightMutation.id, params: undoMutationParams }, ...undos],
                redoMutations: [{ id: SetWorksheetRowIsAutoHeightMutation.id, params: redoMutationParams }, ...redos],
            });

            return true;
        }

        return false;
    },
};
