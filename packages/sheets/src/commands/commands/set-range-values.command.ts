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

import type { IAccessor, ICellData, ICommand, IObjectMatrixPrimitiveType, IRange } from '@univerjs/core';
import type { ISheetCommandSharedParams } from '../utils/interface';
import {
    CommandType,
    ICommandService,
    isICellData,
    IUndoRedoService,
    IUniverInstanceService,
    mapObjectMatrix,
    ObjectMatrix,
    sequenceExecute,
    Tools,
} from '@univerjs/core';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../mutations/set-range-values.mutation';
import { followSelectionOperation } from './utils/selection-utils';
import { getSheetCommandTarget } from './utils/target-util';

export interface ISetRangeValuesCommandParams extends Partial<ISheetCommandSharedParams> {
    range?: IRange;

    /**
     * 1. ICellData: Normal cell data
     * 2. ICellData[][]: The two-dimensional array indicates the data of multiple cells
     * 3. IObjectMatrixPrimitiveType<ICellData>: Bring the row/column information MATRIX, indicating the data of multiple cells
     */
    value: ICellData | ICellData[][] | IObjectMatrixPrimitiveType<ICellData>;

    redoUndoId?: string;
}

/**
 * The command to set values for ranges.
 */
export const SetRangeValuesCommand: ICommand = {
    id: 'sheet.command.set-range-values',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: (accessor: IAccessor, params: ISetRangeValuesCommandParams) => {
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), params);
        if (!target) return false;

        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const currentSelections = selectionManagerService.getCurrentSelections()?.map((s) => s.range);

        const { value, range, redoUndoId } = params;
        let ranges = range ? [range] : currentSelections;
        if (!ranges || !ranges.length) return false;

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const { subUnitId, unitId, workbook, worksheet } = target;

        const cellValue = new ObjectMatrix<ICellData>();
        let realCellValue: IObjectMatrixPrimitiveType<ICellData> | undefined;

        if (Tools.isArray(value)) {
            for (let i = 0; i < ranges.length; i++) {
                const { startRow, startColumn, endRow, endColumn } = ranges[i];

                for (let r = startRow; r <= endRow; r++) {
                    for (let c = startColumn; c <= endColumn; c++) {
                        cellValue.setValue(r, c, value[r - startRow][c - startColumn]);
                    }
                }
            }
        } else if (isICellData(value)) {
            for (let i = 0; i < ranges.length; i++) {
                const { startRow, startColumn, endRow, endColumn } = ranges[i];

                for (let r = startRow; r <= endRow; r++) {
                    for (let c = startColumn; c <= endColumn; c++) {
                        cellValue.setValue(r, c, value);
                    }
                }
            }
        } else {
            realCellValue = value as IObjectMatrixPrimitiveType<ICellData>;
            ranges = realCellValue ? [new ObjectMatrix(realCellValue).getStartEndScope()] : [];
        }

        const setRangeValuesMutationRedoParams = { unitId, subUnitId, cellValue: realCellValue ?? cellValue.getMatrix() };
        const setRangeValuesMutationUndoParams = SetRangeValuesUndoMutationFactory(accessor, setRangeValuesMutationRedoParams);
        const cellHeights = mapObjectMatrix(setRangeValuesMutationRedoParams.cellValue, (row, col) => worksheet.getCellHeight(row, col) || undefined);

        const setValueMutationResult = commandService.syncExecuteCommand(SetRangeValuesMutation.id, setRangeValuesMutationRedoParams);
        if (!setValueMutationResult) return false;

        const { undos, redos } = sheetInterceptorService.onCommandExecute({
            id: SetRangeValuesCommand.id,
            params: setRangeValuesMutationRedoParams,
        });

        const { undos: autoHeightUndos, redos: autoHeightRedos } = sheetInterceptorService.generateMutationsOfAutoHeight({
            unitId,
            subUnitId,
            ranges,
            cellHeights: new ObjectMatrix<number>(cellHeights as IObjectMatrixPrimitiveType<number>),
        });

        const result = sequenceExecute([...redos, ...autoHeightRedos], commandService);
        if (result.result) {
            const redoMutations = [
                { id: SetRangeValuesMutation.id, params: setRangeValuesMutationRedoParams },
                ...redos,
                ...autoHeightRedos,
                followSelectionOperation(ranges[ranges.length - 1], workbook, worksheet),
            ];
            const undoMutations = [
                { id: SetRangeValuesMutation.id, params: setRangeValuesMutationUndoParams },
                ...undos,
                ...autoHeightUndos,
            ];

            if (currentSelections && currentSelections.length) {
                undoMutations.push(followSelectionOperation(currentSelections[currentSelections.length - 1], workbook, worksheet));
            }

            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations,
                redoMutations,
                id: redoUndoId,
            });

            return true;
        }

        return false;
    },
};
