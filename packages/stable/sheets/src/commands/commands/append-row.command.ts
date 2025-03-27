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

import type { IAccessor, ICellData, ICommand, IMutationInfo, IObjectMatrixPrimitiveType } from '@univerjs/core';
import type {
    IInsertColMutationParams,
    IInsertRowMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
} from '../../basics/interfaces/mutation-interface';

import type { ISetRangeValuesMutationParams } from '../mutations/set-range-values.mutation';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    sequenceExecute,
} from '@univerjs/core';
import {
    InsertColMutation,
    InsertColMutationUndoFactory,
    InsertRowMutation,
    InsertRowMutationUndoFactory,
} from '../mutations/insert-row-col.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../mutations/remove-row-col.mutation';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../mutations/set-range-values.mutation';

export interface IAppendRowCommandParams {
    unitId: string;
    subUnitId: string;
    cellValue: IObjectMatrixPrimitiveType<ICellData>;
    insertRowNums?: number;
    insertColumnNums?: number;
    maxRows?: number;
    maxColumns?: number;
}
export const AppendRowCommandId = 'sheet.command.append-row';

/**
 * this command and its interface should not be exported from index.ts
 *
 * @internal
 */
export const AppendRowCommand: ICommand<IAppendRowCommandParams> = {
    type: CommandType.COMMAND,
    id: AppendRowCommandId,
    handler: (accessor: IAccessor, params: IAppendRowCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const { unitId, subUnitId, cellValue, insertRowNums, insertColumnNums, maxRows, maxColumns } = params;

        // Set row values
        const setRangeValuesMutationRedoParams: ISetRangeValuesMutationParams = {
            unitId,
            subUnitId,
            cellValue,
        };
        const setRangeValuesMutationUndoParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            setRangeValuesMutationRedoParams
        );

        const redoMutations: IMutationInfo[] = [{ id: SetRangeValuesMutation.id, params: setRangeValuesMutationRedoParams }];
        const undoMutations: IMutationInfo[] = [{ id: SetRangeValuesMutation.id, params: setRangeValuesMutationUndoParams }];

        // If the last row is not empty, insert a row in last
        if (insertRowNums) {
            // Insert a row in last
            const insertRowRedoParams: IInsertRowMutationParams = {
                unitId,
                subUnitId,
                range: {
                    startRow: maxRows as number,
                    endRow: maxRows as number,
                    startColumn: 0,
                    endColumn: (maxColumns as number) - 1,
                },
            };
            const insertRowUndoParams: IRemoveRowsMutationParams = InsertRowMutationUndoFactory(
                accessor,
                insertRowRedoParams
            );

            redoMutations.unshift({ id: InsertRowMutation.id, params: insertRowRedoParams });
            undoMutations.push({ id: RemoveRowMutation.id, params: insertRowUndoParams });
        }

        // If the append row data has more columns than the current sheet, insert columns in last
        if (insertColumnNums) {
            // Insert columns in last
            const insertColRedoParams: IInsertColMutationParams = {
                unitId,
                subUnitId,
                range: {
                    startRow: 0,
                    endRow: (maxRows as number) - 1,
                    startColumn: maxColumns as number,
                    endColumn: (maxColumns as number) - 1 + insertColumnNums,
                },
            };
            const insertColUndoParams: IRemoveColMutationParams = InsertColMutationUndoFactory(
                accessor,
                insertColRedoParams
            );

            redoMutations.unshift({ id: InsertColMutation.id, params: insertColRedoParams });
            undoMutations.push({ id: RemoveColMutation.id, params: insertColUndoParams });
        }

        const result = sequenceExecute(redoMutations, commandService);

        if (result.result) {
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
