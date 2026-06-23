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

import type {
    IAccessor,
    ICellData,
    ICommand,
    IRange,
    ISelectionCell,
    Nullable,
    Workbook,
    Worksheet,
} from '@univerjs/core';
import type { LocaleKey } from '../../locale/types';
import type { IMoveRangeMutationParams } from '../mutations/move-range.mutation';
import type { ISetSelectionsOperationParams } from '../operations/selection.operation';
import {
    cellToRange,
    CommandType,
    ErrorService,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    ObjectMatrix,
    Range,
    Rectangle,
    sequenceExecute,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { SelectionMoveType } from '../../services/selections/type';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { MoveRangeMutation } from '../mutations/move-range.mutation';
import { SetSelectionsOperation } from '../operations/selection.operation';
import { alignToMergedCellsBorders, getPrimaryForRange } from './utils/selection-utils';
import { getSheetCommandTarget } from './utils/target-util';

export interface IMoveRangeCommandParams {
    toRange: IRange;
    fromRange: IRange;
    fromUnitId?: string;
    fromSubUnitId?: string;
    toUnitId?: string;
    toSubUnitId?: string;
}
export const MoveRangeCommandId = 'sheet.command.move-range';

interface IResolvedMoveRangeContext {
    unitId: string;
    fromSubUnitId: string;
    toSubUnitId: string;
    fromWorksheet: Worksheet;
    toWorksheet: Worksheet;
}

interface IGetMoveRangeCommandMutationsOptions {
    includeSelection?: boolean;
    includeAfterCommand?: boolean;
    includeAutoHeight?: boolean;
}

export const MoveRangeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: MoveRangeCommandId,
    handler: async (accessor: IAccessor, params: IMoveRangeCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const errorService = accessor.get(ErrorService);
        const localeService = accessor.get(LocaleService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const perform = await sheetInterceptorService.beforeCommandExecute({ id: MoveRangeCommand.id, params });

        if (!perform) {
            return false;
        }

        const moveRangeCommandMutations = getMoveRangeCommandMutations(accessor, params);
        if (!moveRangeCommandMutations) {
            errorService.emit(localeService.t<LocaleKey>('sheets.info.acrossMergedCell'));
            return false;
        }

        const result = sequenceExecute(moveRangeCommandMutations.redos, commandService).result;

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: moveRangeCommandMutations.unitId,
                undoMutations: moveRangeCommandMutations.undos,
                redoMutations: moveRangeCommandMutations.redos,
            });
            return true;
        }
        return false;
    },
};

function _resolveMoveRangeContext(accessor: IAccessor, params: IMoveRangeCommandParams): IResolvedMoveRangeContext | null {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const target = getSheetCommandTarget(univerInstanceService);

    const unitId = params.toUnitId ?? params.fromUnitId ?? target?.unitId;
    const fromSubUnitId = params.fromSubUnitId ?? target?.subUnitId;
    const toSubUnitId = params.toSubUnitId ?? params.fromSubUnitId ?? target?.subUnitId;

    if (!unitId || !fromSubUnitId || !toSubUnitId) {
        return null;
    }

    if (params.fromUnitId && params.toUnitId && params.fromUnitId !== params.toUnitId) {
        return null;
    }

    const workbook = univerInstanceService.getUniverSheetInstance(unitId);
    const fromWorksheet = workbook?.getSheetBySheetId(fromSubUnitId);
    const toWorksheet = workbook?.getSheetBySheetId(toSubUnitId);

    if (!fromWorksheet || !toWorksheet) {
        return null;
    }

    return {
        unitId,
        fromSubUnitId,
        toSubUnitId,
        fromWorksheet,
        toWorksheet,
    };
}

export function getMoveRangeCommandMutations(
    accessor: IAccessor,
    params: IMoveRangeCommandParams,
    options: IGetMoveRangeCommandMutationsOptions = {}
) {
    const {
        includeSelection = true,
        includeAfterCommand = true,
        includeAutoHeight = true,
    } = options;

    const context = _resolveMoveRangeContext(accessor, params);
    if (!context) {
        return null;
    }

    const sheetInterceptorService = accessor.get(SheetInterceptorService);
    const { unitId, fromSubUnitId, toSubUnitId, fromWorksheet, toWorksheet } = context;

    const moveRangeMutations = getMoveRangeUndoRedoMutations(
        accessor,
        { unitId, subUnitId: fromSubUnitId, range: params.fromRange },
        { unitId, subUnitId: toSubUnitId, range: params.toRange }
    );
    if (moveRangeMutations === null) {
        return null;
    }

    const commandInfo = {
        id: MoveRangeCommand.id,
        params,
    };

    const interceptorCommands = sheetInterceptorService.onCommandExecute(commandInfo);
    const redos = [
        ...(interceptorCommands.preRedos ?? []),
        ...moveRangeMutations.redos,
        ...interceptorCommands.redos,
    ];
    const undos = [
        ...(interceptorCommands.preUndos ?? []),
        ...moveRangeMutations.undos,
        ...interceptorCommands.undos,
    ];

    if (includeSelection) {
        redos.push({
            id: SetSelectionsOperation.id,
            params: {
                unitId,
                subUnitId: toSubUnitId,
                selections: [{ range: params.toRange, primary: getPrimaryAfterMove(params.fromRange, params.toRange, fromWorksheet, toWorksheet) }],
                type: SelectionMoveType.MOVE_END,
            } as ISetSelectionsOperationParams,
        });
        undos.push({
            id: SetSelectionsOperation.id,
            params: {
                unitId,
                subUnitId: fromSubUnitId,
                selections: [{ range: params.fromRange, primary: getPrimaryForRange(params.fromRange, fromWorksheet) }],
                type: SelectionMoveType.MOVE_END,
            } as ISetSelectionsOperationParams,
        });
    }

    if (includeAfterCommand) {
        const afterInterceptors = sheetInterceptorService.afterCommandExecute(commandInfo);
        redos.push(...afterInterceptors.redos);
        undos.push(...afterInterceptors.undos);
    }

    if (includeAutoHeight) {
        const { undos: autoHeightUndos, redos: autoHeightRedos } = sheetInterceptorService.generateMutationsOfAutoHeight({
            unitId,
            subUnitId: toSubUnitId,
            ranges: fromSubUnitId === toSubUnitId ? [params.fromRange, params.toRange] : [params.toRange],
        });

        redos.push(...autoHeightRedos);
        undos.push(...autoHeightUndos);
    }

    return {
        unitId,
        redos,
        undos,
    };
}

export interface IRangeUnit {
    unitId: string;
    subUnitId: string;
    range: IRange;
}

// eslint-disable-next-line max-lines-per-function
export function getMoveRangeUndoRedoMutations(
    accessor: IAccessor,
    from: IRangeUnit,
    to: IRangeUnit,
    ignoreMerge = false
) {
    const unitId = from.unitId;
    const workbook = accessor.get(IUniverInstanceService).getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
    if (!workbook) {
        return null;
    }

    const { subUnitId: fromSubUnitId, range: fromRange } = from;
    const { subUnitId: toSubUnitId, range: toRange } = to;
    const fromWorksheet = workbook.getSheetBySheetId(fromSubUnitId);
    const toWorksheet = workbook.getSheetBySheetId(toSubUnitId);
    if (!fromWorksheet || !toWorksheet) {
        return null;
    }

    const alignedRangeWithToRange = alignToMergedCellsBorders(toRange, toWorksheet, false);
    if (!Rectangle.equals(toRange, alignedRangeWithToRange) && !ignoreMerge) {
        return null;
    }

    const fromWorksheetCellMatrix = fromWorksheet.getCellMatrix();
    const toWorksheetCellMatrix = toWorksheet.getCellMatrix();

    const fromRedoCellValue = new ObjectMatrix<Nullable<ICellData>>();
    const fromUndoCellValue = new ObjectMatrix<Nullable<ICellData>>();

    const toRedoCellValue = new ObjectMatrix<Nullable<ICellData>>();
    const toUndoCellValue = new ObjectMatrix<Nullable<ICellData>>();

    Range.foreach(fromRange, (row, col) => {
        const cellData = Tools.deepClone(fromWorksheetCellMatrix.getValue(row, col)) ?? null;
        if (cellData?.s) {
            cellData.s = workbook.getStyles().get(cellData.s);
        }

        fromRedoCellValue.setValue(row, col, null);
        fromUndoCellValue.setValue(row, col, cellData);

        const cellRange = cellToRange(row, col);
        const relativeRange = Rectangle.getRelativeRange(cellRange, fromRange);
        const range = Rectangle.getPositionRange(relativeRange, toRange);
        toRedoCellValue.setValue(range.startRow, range.startColumn, Tools.deepClone(cellData));
    });

    Range.foreach(toRange, (row, col) => {
        const cellData = Tools.deepClone(toWorksheetCellMatrix.getValue(row, col)) ?? null;
        toUndoCellValue.setValue(row, col, cellData);
    });

    const redoMoveRangeMutationParams: IMoveRangeMutationParams = {
        fromRange: from.range,
        toRange: to.range,
        from: {
            value: fromRedoCellValue.getMatrix(),
            subUnitId: fromSubUnitId,
        },
        to: {
            value: toRedoCellValue.getMatrix(),
            subUnitId: toSubUnitId,
        },
        unitId,
    };
    const undoMoveRangeMutationParams: IMoveRangeMutationParams = {
        fromRange: to.range,
        toRange: from.range,
        from: {
            value: toUndoCellValue.getMatrix(),
            subUnitId: toSubUnitId,
        },
        to: {
            value: fromUndoCellValue.getMatrix(),
            subUnitId: fromSubUnitId,
        },
        unitId,
    };

    return {
        redos: [{ id: MoveRangeMutation.id, params: redoMoveRangeMutationParams }],
        undos: [{ id: MoveRangeMutation.id, params: undoMoveRangeMutationParams }],
    };
}

// Before moveRange is executed, the target area has no merge cell yet.
// So need to get the merge info of the start cell and then transform it
function getPrimaryAfterMove(fromRange: IRange, toRange: IRange, sourceWorksheet: Worksheet, targetWorksheet: Worksheet = sourceWorksheet): ISelectionCell {
    const startRow = fromRange.startRow;
    const startColumn = fromRange.startColumn;
    const mergeInfo = sourceWorksheet.getMergedCell(startRow, startColumn);

    const res = getPrimaryForRange(toRange, targetWorksheet);
    if (mergeInfo) {
        const mergeRowCount = mergeInfo.endRow - mergeInfo.startRow + 1;
        const mergeColCount = mergeInfo.endColumn - mergeInfo.startColumn + 1;
        res.endRow = res.startRow + mergeRowCount - 1;
        res.endColumn = res.startColumn + mergeColCount - 1;
        res.actualRow = res.startRow;
        res.actualColumn = res.startColumn;
        res.isMerged = false;
        res.isMergedMainCell = true;
    }

    return res;
}
