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

import type { IAccessor, ICellData, IRange, Nullable, Workbook } from '@univerjs/core';
import type { IInsertColMutationParams, IRemoveColMutationParams } from '../../basics';
import type { ISetRangeValuesMutationParams } from '../mutations/set-range-values.mutation';

import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, ObjectMatrix, Range, sequenceExecute, UniverInstanceType } from '@univerjs/core';
import { type SplitDelimiterEnum, splitRangeText } from '../../basics/split-range-text';
import { InsertColMutation, InsertColMutationUndoFactory } from '../mutations/insert-row-col.mutation';
import { RemoveColMutation } from '../mutations/remove-row-col.mutation';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../mutations/set-range-values.mutation';
import { getSheetCommandTarget } from './utils/target-util';

export interface ISplitTextToColumnsCommandParams {
    unitId: string;
    subUnitId: string;
    range: IRange;
    delimiter?: SplitDelimiterEnum;
    customDelimiter?: string;
    treatMultipleDelimitersAsOne?: boolean;
}

export const SplitTextToColumnsCommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.split-text-to-columns',
    // eslint-disable-next-line max-lines-per-function
    handler: (accessor: IAccessor, params: ISplitTextToColumnsCommandParams) => {
        const { unitId, subUnitId, range, delimiter, customDelimiter, treatMultipleDelimitersAsOne } = params;

        const commandService = accessor.get(ICommandService);

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) return false;

        const { lastRow, rs, maxLength } = splitRangeText(worksheet, range, delimiter, customDelimiter, treatMultipleDelimitersAsOne);
        const maxColumn = worksheet.getColumnCount();
        const { startColumn } = Range.transformRange(range, worksheet);

        if (range.startColumn !== range.endColumn) {
            return false;
        }

        const redoMutations = [];
        const undoMutations = [];

        // insert columns if needed
        const insertColCount = startColumn + maxLength + 1 - maxColumn;
        if (insertColCount > 0) {
            const insertColParams: IInsertColMutationParams = {
                unitId,
                subUnitId,
                range: {
                    startRow: 0,
                    endRow: worksheet.getRowCount() - 1,
                    startColumn: maxColumn - 1,
                    endColumn: maxColumn - 1 + insertColCount,
                },

            };

            redoMutations.push({
                id: InsertColMutation.id,
                params: insertColParams,
            });

            const undoColInsertionParams: IRemoveColMutationParams = InsertColMutationUndoFactory(
                accessor,
                insertColParams
            );

            undoMutations.push({ id: RemoveColMutation.id, params: undoColInsertionParams });
        }

        // set values
        const destRange = {
            startRow: range.startRow,
            endRow: lastRow,
            startColumn,
            endColumn: startColumn + maxLength,
        };
        const cellValue = new ObjectMatrix<Nullable<ICellData>>();
        for (let i = destRange.startRow; i <= destRange.endRow; i++) {
            for (let j = destRange.startColumn; j <= destRange.endColumn; j++) {
                const values = rs[i - destRange.startRow];
                if (j === 0 && values?.length === 1) {
                    cellValue.setValue(i, j, worksheet.getCell(i, j));
                } else {
                    cellValue.setValue(i, j, {
                        v: values?.[j - destRange.startColumn] || null,
                        p: null,
                        f: null,
                        si: null,
                        custom: null,
                    });
                }
            }
        }

        const setValuesParams: ISetRangeValuesMutationParams = {
            unitId,
            subUnitId,
            cellValue: cellValue.clone(),
        };
        const undoSetValuesParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(accessor, setValuesParams);

        redoMutations.push({
            id: SetRangeValuesMutation.id,
            params: setValuesParams,
        });
        undoMutations.unshift({
            id: SetRangeValuesMutation.id,
            params: undoSetValuesParams,
        });

        const result = sequenceExecute(redoMutations, commandService).result;
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations,
                redoMutations,
            });
            return true;
        }

        return false;
    },
};
