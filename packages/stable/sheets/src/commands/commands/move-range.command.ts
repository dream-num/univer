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

import type { IAccessor, ICellData, ICommand, IMutationInfo, IRange, ISelectionCell, IStyleData, Nullable, Worksheet } from '@univerjs/core';
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
}
export const MoveRangeCommandId = 'sheet.command.move-range';

export const MoveRangeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: MoveRangeCommandId,

    handler: async (accessor: IAccessor, params: IMoveRangeCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const errorService = accessor.get(ErrorService);
        const localeService = accessor.get(LocaleService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const perform = await sheetInterceptorService.beforeCommandExecute({ id: MoveRangeCommand.id, params });

        if (!perform) {
            return false;
        }

        const { worksheet, subUnitId, unitId } = target;
        const moveRangeMutations = getMoveRangeUndoRedoMutations(
            accessor,
            { unitId, subUnitId, range: params.fromRange },
            { unitId, subUnitId, range: params.toRange }
        );
        if (moveRangeMutations === null) {
            errorService.emit(localeService.t('sheets.info.acrossMergedCell'));
            return false;
        }

        const interceptorCommands = sheetInterceptorService.onCommandExecute({
            id: MoveRangeCommand.id,
            params: { ...params },
        });

        const redos = [
            ...(interceptorCommands.preRedos ?? []),
            ...moveRangeMutations.redos,
            ...interceptorCommands.redos,
            {
                id: SetSelectionsOperation.id,
                params: {
                    unitId,
                    subUnitId,
                    selections: [{ range: params.toRange, primary: getPrimaryAfterMove(params.fromRange, params.toRange, worksheet) }],
                    type: SelectionMoveType.MOVE_END,
                } as ISetSelectionsOperationParams,
            },
        ];
        const undos = [
            ...(interceptorCommands.preUndos ?? []),
            ...moveRangeMutations.undos,
            ...interceptorCommands.undos,
            {
                id: SetSelectionsOperation.id,
                params: {
                    unitId,
                    subUnitId,
                    selections: [{ range: params.fromRange, primary: getPrimaryForRange(params.fromRange, worksheet) }],
                    type: SelectionMoveType.MOVE_END,
                } as ISetSelectionsOperationParams,
            },
        ];

        const result = sequenceExecute(redos, commandService).result;

        const afterInterceptors = sheetInterceptorService.afterCommandExecute({
            id: MoveRangeCommand.id,
            params: { ...params },
        });

        if (result) {
            sequenceExecute(afterInterceptors.redos, commandService);
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [...undos, ...afterInterceptors.undos],
                redoMutations: [...redos, ...afterInterceptors.redos],
            });
            return true;
        }
        return false;
    },
};

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
    const redos: IMutationInfo[] = [];
    const undos: IMutationInfo[] = [];
    const { range: fromRange, subUnitId: fromSubUnitId, unitId } = from;
    const { range: toRange, subUnitId: toSubUnitId } = to;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getUniverSheetInstance(unitId);
    const toWorksheet = workbook?.getSheetBySheetId(toSubUnitId);
    const fromWorksheet = workbook?.getSheetBySheetId(fromSubUnitId);
    const toCellMatrix = toWorksheet?.getCellMatrix();
    const fromCellMatrix = fromWorksheet?.getCellMatrix();
    if (toWorksheet && fromWorksheet && toCellMatrix && fromCellMatrix) {
        const alignedRangeWithToRange = alignToMergedCellsBorders(toRange, toWorksheet, false);

        if (!Rectangle.equals(toRange, alignedRangeWithToRange) && !ignoreMerge) {
            return null;
        }

        const fromCellValue = new ObjectMatrix<Nullable<ICellData>>();
        const newFromCellValue = new ObjectMatrix<Nullable<ICellData>>();
        const fromCellStyle = new ObjectMatrix<Nullable<IStyleData>>();

        Range.foreach(fromRange, (row, col) => {
            const cellData = fromCellMatrix.getValue(row, col);
            fromCellValue.setValue(row, col, Tools.deepClone(cellData));
            if (cellData) {
                const style = workbook?.getStyles().get(cellData.s);
                fromCellStyle.setValue(row, col, Tools.deepClone(style));
            }
            newFromCellValue.setValue(row, col, null);
        });
        const toCellValue = new ObjectMatrix<Nullable<ICellData>>();
        const newToCellValue = new ObjectMatrix<Nullable<ICellData>>();

        Range.foreach(toRange, (row, col) => {
            toCellValue.setValue(row, col, Tools.deepClone(toCellMatrix.getValue(row, col)));
        });

        Range.foreach(fromRange, (row, col) => {
            const cellRange = cellToRange(row, col);
            const relativeRange = Rectangle.getRelativeRange(cellRange, fromRange);
            const range = Rectangle.getPositionRange(relativeRange, toRange);

            const styleValue = Tools.deepClone(fromCellStyle.getValue(row, col));
            const cellValue = Tools.deepClone(fromCellValue.getValue(row, col));
            if (cellValue && styleValue) {
                cellValue.s = styleValue;
            }
            newToCellValue.setValue(range.startRow, range.startColumn, cellValue);
        });

        const doMoveRangeMutation: IMoveRangeMutationParams = {
            fromRange: from.range,
            toRange: to.range,
            from: {
                value: newFromCellValue.getMatrix(),
                subUnitId: fromSubUnitId,
            },
            to: {
                value: newToCellValue.getMatrix(),
                subUnitId: toSubUnitId,
            },
            unitId,
        };
        const undoMoveRangeMutation: IMoveRangeMutationParams = {
            fromRange: to.range,
            toRange: from.range,
            from: {
                value: fromCellValue.getMatrix(),
                subUnitId: fromSubUnitId,
            },
            to: {
                value: toCellValue.getMatrix(),
                subUnitId: toSubUnitId,
            },
            unitId,
        };

        redos.push({ id: MoveRangeMutation.id, params: doMoveRangeMutation });
        undos.push({ id: MoveRangeMutation.id, params: undoMoveRangeMutation });
    }

    return {
        redos,
        undos,
    };
}

// Before moveRange is executed, the target area has no merge cell yet.
// So need to get the merge info of the start cell and then transform it
function getPrimaryAfterMove(fromRange: IRange, toRange: IRange, worksheet: Worksheet): ISelectionCell {
    const startRow = fromRange.startRow;
    const startColumn = fromRange.startColumn;
    const mergeInfo = worksheet.getMergedCell(startRow, startColumn);

    const res = getPrimaryForRange(toRange, worksheet);
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
